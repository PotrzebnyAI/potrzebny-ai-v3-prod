package ai.potrzebny.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import ai.potrzebny.app.feature.auth.AuthViewModel
import ai.potrzebny.app.feature.auth.LoginScreen
import ai.potrzebny.app.feature.dashboard.DashboardScreen
import ai.potrzebny.app.ui.theme.PotrzebnyTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            PotrzebnyTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val authViewModel: AuthViewModel = viewModel()
                    val isAuthenticated by authViewModel.isAuthenticated.collectAsState()

                    if (isAuthenticated) {
                        MainNavigation()
                    } else {
                        LoginScreen(
                            onLoginSuccess = { authViewModel.checkAuthentication() },
                            onNavigateToSignup = { /* Navigate to signup */ }
                        )
                    }
                }
            }
        }
    }
}
