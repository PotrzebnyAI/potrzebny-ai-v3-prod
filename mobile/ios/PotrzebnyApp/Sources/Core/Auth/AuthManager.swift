import Foundation
import Security
import LocalAuthentication

final class AuthManager: ObservableObject {
    static let shared = AuthManager()

    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false

    private let keychainService = "ai.potrzebny.app"
    private let tokenKey = "authToken"

    private init() {
        checkAuthentication()
    }

    // MARK: - Authentication

    func login(email: String, password: String, totpCode: String? = nil) async throws {
        await MainActor.run { isLoading = true }
        defer { Task { @MainActor in isLoading = false } }

        let body = LoginRequest(email: email, password: password, totpCode: totpCode)

        let response: LoginResponse = try await NetworkManager.shared.request(
            endpoint: "/auth/login",
            method: .post,
            body: body,
            requiresAuth: false
        )

        try saveToken(response.token)
        NetworkManager.shared.setAuthToken(response.token)

        await MainActor.run {
            self.currentUser = response.user
            self.isAuthenticated = true
        }
    }

    func signup(email: String, password: String, firstName: String?, lastName: String?) async throws {
        await MainActor.run { isLoading = true }
        defer { Task { @MainActor in isLoading = false } }

        let body = SignupRequest(
            email: email,
            password: password,
            confirmPassword: password,
            firstName: firstName,
            lastName: lastName,
            acceptTerms: true,
            acceptPrivacy: true
        )

        let _: SignupResponse = try await NetworkManager.shared.request(
            endpoint: "/auth/register",
            method: .post,
            body: body,
            requiresAuth: false
        )

        // User needs to verify email before logging in
    }

    func logout() {
        deleteToken()
        NetworkManager.shared.setAuthToken(nil)

        Task { @MainActor in
            self.currentUser = nil
            self.isAuthenticated = false
        }
    }

    func authenticateWithBiometrics() async throws {
        let context = LAContext()
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            throw AuthError.biometricsNotAvailable
        }

        let reason = "Zaloguj się do Potrzebny.AI"

        let success = try await context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: reason
        )

        if success {
            try await refreshSession()
        } else {
            throw AuthError.biometricsFailed
        }
    }

    // MARK: - Session Management

    func checkAuthentication() {
        guard let token = getToken() else {
            isAuthenticated = false
            return
        }

        NetworkManager.shared.setAuthToken(token)

        Task {
            do {
                try await refreshSession()
            } catch {
                logout()
            }
        }
    }

    func refreshSession() async throws {
        await MainActor.run { isLoading = true }
        defer { Task { @MainActor in isLoading = false } }

        let response: UserProfileResponse = try await NetworkManager.shared.request(
            endpoint: "/user/profile",
            method: .get
        )

        await MainActor.run {
            self.currentUser = User(
                id: response.userId,
                email: response.email,
                firstName: response.firstName,
                lastName: response.lastName,
                role: response.role
            )
            self.isAuthenticated = true
        }
    }

    // MARK: - Keychain

    private func saveToken(_ token: String) throws {
        let data = token.data(using: .utf8)!

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: tokenKey,
            kSecValueData as String: data
        ]

        SecItemDelete(query as CFDictionary)

        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw AuthError.keychainError
        }
    }

    private func getToken() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: tokenKey,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let token = String(data: data, encoding: .utf8) else {
            return nil
        }

        return token
    }

    private func deleteToken() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: tokenKey
        ]

        SecItemDelete(query as CFDictionary)
    }
}

// MARK: - Models

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let firstName: String?
    let lastName: String?
    let role: String

    var displayName: String {
        if let firstName = firstName, let lastName = lastName {
            return "\(firstName) \(lastName)"
        }
        return email.components(separatedBy: "@").first ?? email
    }
}

struct LoginRequest: Encodable {
    let email: String
    let password: String
    let totpCode: String?
}

struct LoginResponse: Decodable {
    let token: String
    let user: User
}

struct SignupRequest: Encodable {
    let email: String
    let password: String
    let confirmPassword: String
    let firstName: String?
    let lastName: String?
    let acceptTerms: Bool
    let acceptPrivacy: Bool
}

struct SignupResponse: Decodable {
    let id: String
    let email: String
    let message: String
}

struct UserProfileResponse: Decodable {
    let userId: String
    let email: String
    let firstName: String?
    let lastName: String?
    let role: String
}

enum AuthError: Error {
    case biometricsNotAvailable
    case biometricsFailed
    case keychainError
    case invalidCredentials

    var localizedDescription: String {
        switch self {
        case .biometricsNotAvailable:
            return "Biometria nie jest dostępna"
        case .biometricsFailed:
            return "Autoryzacja biometryczna nie powiodła się"
        case .keychainError:
            return "Błąd przechowywania danych"
        case .invalidCredentials:
            return "Nieprawidłowe dane logowania"
        }
    }
}
