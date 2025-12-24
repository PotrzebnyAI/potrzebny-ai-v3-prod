import Foundation
import Combine

enum NetworkError: Error {
    case invalidURL
    case noData
    case decodingError
    case unauthorized
    case serverError(Int)
    case networkError(Error)

    var localizedDescription: String {
        switch self {
        case .invalidURL:
            return "Nieprawidłowy adres URL"
        case .noData:
            return "Brak danych"
        case .decodingError:
            return "Błąd przetwarzania danych"
        case .unauthorized:
            return "Brak autoryzacji"
        case .serverError(let code):
            return "Błąd serwera (\(code))"
        case .networkError(let error):
            return "Błąd sieci: \(error.localizedDescription)"
        }
    }
}

struct APIResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: T?
    let error: String?
    let timestamp: String
    let traceId: String
}

final class NetworkManager: ObservableObject {
    static let shared = NetworkManager()

    private let baseURL: String
    private let session: URLSession
    private var authToken: String?

    private init() {
        self.baseURL = Configuration.apiBaseURL
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
    }

    func setAuthToken(_ token: String?) {
        self.authToken = token
    }

    func request<T: Decodable>(
        endpoint: String,
        method: HTTPMethod = .get,
        body: Encodable? = nil,
        requiresAuth: Bool = true
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw NetworkError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if requiresAuth, let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        do {
            let (data, response) = try await session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw NetworkError.noData
            }

            switch httpResponse.statusCode {
            case 200...299:
                let apiResponse = try JSONDecoder().decode(APIResponse<T>.self, from: data)
                guard let responseData = apiResponse.data else {
                    throw NetworkError.noData
                }
                return responseData

            case 401:
                throw NetworkError.unauthorized

            default:
                throw NetworkError.serverError(httpResponse.statusCode)
            }
        } catch let error as NetworkError {
            throw error
        } catch is DecodingError {
            throw NetworkError.decodingError
        } catch {
            throw NetworkError.networkError(error)
        }
    }
}

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case patch = "PATCH"
    case delete = "DELETE"
}

struct Configuration {
    static let apiBaseURL = "https://potrzebny.ai/api"
    static let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
}
