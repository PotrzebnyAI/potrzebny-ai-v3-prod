import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
    @Binding var showLogin: Bool

    @State private var email = ""
    @State private var password = ""
    @State private var totpCode = ""
    @State private var showTOTP = false
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showBiometricButton = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Logo
                VStack(spacing: 8) {
                    Image(systemName: "brain.head.profile")
                        .font(.system(size: 60))
                        .foregroundColor(.blue)

                    Text("Potrzebny.AI")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Zaloguj się do swojego konta")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 40)

                // Form
                VStack(spacing: 16) {
                    // Email
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Email")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        TextField("twoj@email.pl", text: $email)
                            .textFieldStyle(.roundedBorder)
                            .keyboardType(.emailAddress)
                            .textContentType(.emailAddress)
                            .autocapitalization(.none)
                            .disabled(isLoading)
                    }

                    // Password
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Hasło")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        SecureField("••••••••", text: $password)
                            .textFieldStyle(.roundedBorder)
                            .textContentType(.password)
                            .disabled(isLoading)
                    }

                    // TOTP Code (if needed)
                    if showTOTP {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Kod 2FA")
                                .font(.caption)
                                .foregroundColor(.secondary)

                            TextField("123456", text: $totpCode)
                                .textFieldStyle(.roundedBorder)
                                .keyboardType(.numberPad)
                                .disabled(isLoading)
                        }
                    }

                    // Forgot Password
                    HStack {
                        Spacer()
                        Button("Zapomniałeś hasła?") {
                            // Navigate to forgot password
                        }
                        .font(.caption)
                        .foregroundColor(.blue)
                    }

                    // Error Message
                    if let error = errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                    }

                    // Login Button
                    Button(action: login) {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        } else {
                            Text("Zaloguj się")
                                .fontWeight(.semibold)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                    .disabled(isLoading || email.isEmpty || password.isEmpty)

                    // Biometric Login
                    if showBiometricButton {
                        Button(action: loginWithBiometrics) {
                            HStack {
                                Image(systemName: "faceid")
                                Text("Zaloguj przez Face ID")
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Color.secondary.opacity(0.2))
                        .foregroundColor(.primary)
                        .cornerRadius(10)
                    }

                    // Divider
                    HStack {
                        Rectangle()
                            .fill(Color.secondary.opacity(0.3))
                            .frame(height: 1)

                        Text("lub")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        Rectangle()
                            .fill(Color.secondary.opacity(0.3))
                            .frame(height: 1)
                    }

                    // Google Sign In
                    Button(action: { /* Google Sign In */ }) {
                        HStack {
                            Image(systemName: "g.circle.fill")
                            Text("Kontynuuj z Google")
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.secondary.opacity(0.2))
                    .foregroundColor(.primary)
                    .cornerRadius(10)
                }
                .padding(.horizontal)

                // Sign Up Link
                HStack {
                    Text("Nie masz konta?")
                        .foregroundColor(.secondary)

                    Button("Zarejestruj się") {
                        showLogin = false
                    }
                    .foregroundColor(.blue)
                }
                .font(.subheadline)
                .padding(.bottom, 40)
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            checkBiometricAvailability()
        }
    }

    private func login() {
        isLoading = true
        errorMessage = nil

        Task {
            do {
                try await authManager.login(
                    email: email,
                    password: password,
                    totpCode: showTOTP ? totpCode : nil
                )
            } catch {
                await MainActor.run {
                    if error.localizedDescription.contains("2FA") {
                        showTOTP = true
                    } else {
                        errorMessage = "Błąd logowania: \(error.localizedDescription)"
                    }
                    isLoading = false
                }
            }
        }
    }

    private func loginWithBiometrics() {
        Task {
            do {
                try await authManager.authenticateWithBiometrics()
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                }
            }
        }
    }

    private func checkBiometricAvailability() {
        // Check if biometrics available and user has previously logged in
        showBiometricButton = true
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView(showLogin: .constant(true))
            .environmentObject(AuthManager.shared)
    }
}
