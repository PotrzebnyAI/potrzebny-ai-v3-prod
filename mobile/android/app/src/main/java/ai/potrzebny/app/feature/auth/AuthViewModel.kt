package ai.potrzebny.app.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class AuthUiState {
    object Initial : AuthUiState()
    object Loading : AuthUiState()
    object Success : AuthUiState()
    object Requires2FA : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Initial)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()

    init {
        checkAuthentication()
    }

    fun checkAuthentication() {
        viewModelScope.launch {
            _isAuthenticated.value = authRepository.isAuthenticated()
        }
    }

    fun login(email: String, password: String, totpCode: String? = null) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading

            try {
                val result = authRepository.login(email, password, totpCode)
                result.fold(
                    onSuccess = {
                        _uiState.value = AuthUiState.Success
                        _isAuthenticated.value = true
                    },
                    onFailure = { error ->
                        if (error.message?.contains("2FA") == true) {
                            _uiState.value = AuthUiState.Requires2FA
                        } else {
                            _uiState.value = AuthUiState.Error(
                                error.message ?: "Błąd logowania"
                            )
                        }
                    }
                )
            } catch (e: Exception) {
                _uiState.value = AuthUiState.Error(e.message ?: "Nieznany błąd")
            }
        }
    }

    fun loginWithBiometrics() {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading

            try {
                val result = authRepository.loginWithBiometrics()
                result.fold(
                    onSuccess = {
                        _uiState.value = AuthUiState.Success
                        _isAuthenticated.value = true
                    },
                    onFailure = { error ->
                        _uiState.value = AuthUiState.Error(
                            error.message ?: "Błąd biometrii"
                        )
                    }
                )
            } catch (e: Exception) {
                _uiState.value = AuthUiState.Error(e.message ?: "Nieznany błąd")
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _isAuthenticated.value = false
            _uiState.value = AuthUiState.Initial
        }
    }
}

interface AuthRepository {
    suspend fun isAuthenticated(): Boolean
    suspend fun login(email: String, password: String, totpCode: String?): Result<Unit>
    suspend fun loginWithBiometrics(): Result<Unit>
    suspend fun logout()
}
