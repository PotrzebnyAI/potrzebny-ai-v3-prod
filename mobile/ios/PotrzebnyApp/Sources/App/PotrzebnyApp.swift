import SwiftUI

@main
struct PotrzebnyApp: App {
    @StateObject private var authManager = AuthManager.shared
    @StateObject private var networkManager = NetworkManager.shared

    init() {
        configureAppearance()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(networkManager)
        }
    }

    private func configureAppearance() {
        // Configure navigation bar
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor.systemBackground
        appearance.titleTextAttributes = [.foregroundColor: UIColor.label]
        appearance.largeTitleTextAttributes = [.foregroundColor: UIColor.label]

        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
        UINavigationBar.appearance().compactAppearance = appearance

        // Configure tab bar
        let tabBarAppearance = UITabBarAppearance()
        tabBarAppearance.configureWithOpaqueBackground()
        UITabBar.appearance().standardAppearance = tabBarAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
    }
}

struct ContentView: View {
    @EnvironmentObject var authManager: AuthManager

    var body: some View {
        Group {
            if authManager.isAuthenticated {
                MainTabView()
            } else {
                AuthView()
            }
        }
        .animation(.easeInOut, value: authManager.isAuthenticated)
    }
}

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "house.fill")
                }
                .tag(0)

            EducationalView()
                .tabItem {
                    Label("Edukacja", systemImage: "book.fill")
                }
                .tag(1)

            PatientView()
                .tabItem {
                    Label("Notatki", systemImage: "heart.fill")
                }
                .tag(2)

            GamificationView()
                .tabItem {
                    Label("Postępy", systemImage: "star.fill")
                }
                .tag(3)

            ProfileView()
                .tabItem {
                    Label("Profil", systemImage: "person.fill")
                }
                .tag(4)
        }
        .accentColor(.blue)
    }
}

struct AuthView: View {
    @State private var showLogin = true

    var body: some View {
        NavigationView {
            if showLogin {
                LoginView(showLogin: $showLogin)
            } else {
                SignupView(showLogin: $showLogin)
            }
        }
    }
}

// Preview
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(AuthManager.shared)
            .environmentObject(NetworkManager.shared)
    }
}
