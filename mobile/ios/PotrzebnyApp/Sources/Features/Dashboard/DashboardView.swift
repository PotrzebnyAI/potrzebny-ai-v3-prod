import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var viewModel = DashboardViewModel()

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Welcome Header
                    WelcomeHeader(userName: viewModel.userName)

                    // Stats Cards
                    StatsSection(stats: viewModel.stats)

                    // Quick Actions
                    QuickActionsSection()

                    // Recent Activity
                    RecentActivitySection(activities: viewModel.recentActivities)

                    // Courses Progress
                    if !viewModel.courses.isEmpty {
                        CoursesSection(courses: viewModel.courses)
                    }
                }
                .padding()
            }
            .navigationTitle("Dashboard")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { viewModel.refresh() }) {
                        Image(systemName: "arrow.clockwise")
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    NavigationLink(destination: ProfileView()) {
                        Image(systemName: "person.circle")
                    }
                }
            }
            .refreshable {
                await viewModel.fetchData()
            }
        }
        .task {
            await viewModel.fetchData()
        }
    }
}

// MARK: - Welcome Header
struct WelcomeHeader: View {
    let userName: String

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Witaj,")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text(userName)
                    .font(.title2)
                    .fontWeight(.bold)
            }
            Spacer()
            Image(systemName: "brain.head.profile")
                .font(.system(size: 40))
                .foregroundColor(.blue)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5)
    }
}

// MARK: - Stats Section
struct StatsSection: View {
    let stats: DashboardStats

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Twoje statystyki")
                .font(.headline)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                StatCard(
                    title: "Poziom",
                    value: "\(stats.level)",
                    icon: "star.fill",
                    color: .yellow
                )
                StatCard(
                    title: "XP",
                    value: "\(stats.xp)",
                    icon: "bolt.fill",
                    color: .purple
                )
                StatCard(
                    title: "Seria",
                    value: "\(stats.streakDays) dni",
                    icon: "flame.fill",
                    color: .orange
                )
                StatCard(
                    title: "Ukończone",
                    value: "\(stats.completedCourses)",
                    icon: "checkmark.circle.fill",
                    color: .green
                )
            }
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)

            Text(value)
                .font(.title3)
                .fontWeight(.bold)

            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5)
    }
}

// MARK: - Quick Actions
struct QuickActionsSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Szybkie akcje")
                .font(.headline)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    QuickActionButton(
                        title: "Fiszki",
                        icon: "rectangle.stack.fill",
                        color: .blue
                    ) {
                        // Navigate to flashcards
                    }

                    QuickActionButton(
                        title: "Quiz",
                        icon: "questionmark.circle.fill",
                        color: .purple
                    ) {
                        // Navigate to quiz
                    }

                    QuickActionButton(
                        title: "Notatki",
                        icon: "note.text",
                        color: .green
                    ) {
                        // Navigate to notes
                    }

                    QuickActionButton(
                        title: "Kursy",
                        icon: "book.fill",
                        color: .orange
                    ) {
                        // Navigate to courses
                    }
                }
            }
        }
    }
}

struct QuickActionButton: View {
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                Text(title)
                    .font(.caption)
            }
            .foregroundColor(color)
            .frame(width: 80, height: 80)
            .background(color.opacity(0.1))
            .cornerRadius(12)
        }
    }
}

// MARK: - Recent Activity
struct RecentActivitySection: View {
    let activities: [Activity]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Ostatnia aktywność")
                .font(.headline)

            if activities.isEmpty {
                Text("Brak aktywności")
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            } else {
                ForEach(activities) { activity in
                    ActivityRow(activity: activity)
                }
            }
        }
    }
}

struct ActivityRow: View {
    let activity: Activity

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: activity.icon)
                .foregroundColor(.blue)
                .frame(width: 32, height: 32)
                .background(Color.blue.opacity(0.1))
                .cornerRadius(8)

            VStack(alignment: .leading, spacing: 2) {
                Text(activity.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text(activity.timestamp)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            if activity.xpEarned > 0 {
                Text("+\(activity.xpEarned) XP")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.green)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5)
    }
}

// MARK: - Courses Section
struct CoursesSection: View {
    let courses: [CourseProgress]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Kontynuuj naukę")
                    .font(.headline)
                Spacer()
                NavigationLink("Zobacz wszystkie") {
                    CoursesListView()
                }
                .font(.caption)
            }

            ForEach(courses) { course in
                CourseProgressCard(course: course)
            }
        }
    }
}

struct CourseProgressCard: View {
    let course: CourseProgress

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(course.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Spacer()
                Text("\(Int(course.progress * 100))%")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            ProgressView(value: course.progress)
                .tint(.blue)

            HStack {
                Image(systemName: "clock")
                    .font(.caption)
                Text("\(course.remainingMinutes) min pozostało")
                    .font(.caption)
                Spacer()
                Button("Kontynuuj") {
                    // Continue course
                }
                .font(.caption)
                .fontWeight(.medium)
            }
            .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5)
    }
}

// MARK: - View Model
@MainActor
class DashboardViewModel: ObservableObject {
    @Published var userName: String = ""
    @Published var stats = DashboardStats()
    @Published var recentActivities: [Activity] = []
    @Published var courses: [CourseProgress] = []
    @Published var isLoading = false

    func fetchData() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let data = try await NetworkManager.shared.request(
                endpoint: "/api/panel/dashboard",
                method: .get,
                responseType: DashboardResponse.self
            )

            userName = data.userName
            stats = data.stats
            recentActivities = data.activities
            courses = data.courses
        } catch {
            print("Error fetching dashboard data: \(error)")
        }
    }

    func refresh() {
        Task {
            await fetchData()
        }
    }
}

// MARK: - Models
struct DashboardStats {
    var level: Int = 1
    var xp: Int = 0
    var streakDays: Int = 0
    var completedCourses: Int = 0
}

struct Activity: Identifiable {
    let id: String
    let title: String
    let icon: String
    let timestamp: String
    let xpEarned: Int
}

struct CourseProgress: Identifiable {
    let id: String
    let title: String
    let progress: Double
    let remainingMinutes: Int
}

struct DashboardResponse: Codable {
    let userName: String
    let stats: DashboardStats
    let activities: [Activity]
    let courses: [CourseProgress]
}

extension DashboardStats: Codable {}
extension Activity: Codable {}
extension CourseProgress: Codable {}

// MARK: - Placeholder Views
struct ProfileView: View {
    var body: some View {
        Text("Profile View")
    }
}

struct CoursesListView: View {
    var body: some View {
        Text("Courses List View")
    }
}

struct DashboardView_Previews: PreviewProvider {
    static var previews: some View {
        DashboardView()
            .environmentObject(AuthManager.shared)
    }
}
