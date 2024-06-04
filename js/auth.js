// Traduz para português brasileiro a autenticação do firebase
firebase.auth().languageCode = 'pt-BR'

// Função que trata a submissão do formulario de autenticação
authForm.onsubmit = function (e) {
    showItem(loading)
    e.preventDefault();
    if (authForm.submitAuthForm.innerHTML === 'Acessar') {
        firebase.auth().signInWithEmailAndPassword(authForm.email.value, authForm.password.value).catch(function (error) {
            showError('Falha no acesso: ', error);
        })
    } else {
        firebase.auth().createUserWithEmailAndPassword(authForm.email.value, authForm.password.value).catch(function (error) {
            showError('Falha no cadastro: ', error);
        })
    }
}

// Função que centraliza e trata autenticação
firebase.auth().onAuthStateChanged(function (user) {
    hideItem(loading)
    if (user) {
        showUserContent(user)
    } else {
        showAuth()
    }
})

// Função que permite ao usuário sair da conta dele
function signOut() {
    firebase.auth().signOut().catch(function () {
        showError('Falha ao sair da conta: ', error);
    })
}

// Função que permite ao usuario  fazer a verificação do e-mail
function sendEmailVerification() {
    showItem(loading)
    let user = firebase.auth().currentUser
    user.sendEmailVerification(actionCodeSettings).then(function () {
        alert('E-mail de verificação foi enviado para ' + user.email + '! Verifique sua caixa de entrada')
    }).catch(function (err) {
        showError('Falha ao enviar o e-mail de verificação: ', err);
    }).finally(function () { hideItem(loading) })
}

// Função que permite o usuário redefinir a senha dele
function sendPasswordResetEmail() {
    let email = prompt('Redefinir senha! Informe o seu endereço de e-mail.', authForm.email.value);
    if (email) {
        showItem(loading);
        firebase.auth().sendPasswordResetEmail(email, actionCodeSettings).then(function () {
            alert('E-mail de redefinição de foi enviado para' + email + '.');
        }).catch(function (err) {
            showError('Falha ao enviar o e-mail de redefinição de senha: ', err);
        }).finally(function () {
            hideItem(loading)
        })
    } else {
        alert('É preciso preencher o campo de e-mail para redefinir senha.')
    }
}

// Função que permite a autenticação pelo Google
function signInWithGoogle() {
    showItem(loading)
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(function (err) {
        alert('Houve um erro ao autenticar usando o Google')
        showError('Falha ao autenticar usando o Google: ', err);
        hideItem(loading)
    })
}

// Função que permite a autenticação pelo GitHUb
function signInWithGitHub() {
    showItem(loading)
    firebase.auth().signInWithPopup(new firebase.auth.GithubAuthProvider()).catch(function (err) {
        alert('Houve um erro ao ')
        showError('Falha ao autenticar usando o GitHUb: ', err);
        hideItem(loading)
    })
}

// Função que permite a autenticação pelo Facebook
function signInWithFacebook() {
    showItem(loading)
    firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider()).catch(function (err) {
        showError('Falha ao autenticar usando o Facebook: ', err);
        hideItem(loading)
    })
}

// Função que permite atualizar nomes de usuarios
function updateUserName() {
    let newUserName = prompt('Informe um novo nome de usuário.', userName.innerHTML)
    if (newUserName && newUserName != '') {
        userName.innerHTML = newUserName
        showItem(loading)
        firebase.auth().currentUser.updateProfile({
            displayName: newUserName
        }).catch(function (err) {
            showError('Falha ao atualizar o nome de usuário: ', err);
        }).finally(function () { hideItem(loading) })
    } else {
        alert('O nome de usuário não pode ser vazio')
    }
}

// Função que permite remover contas de usuarios
function deleteCount() {
    let confirmation = confirm('Realmente deseja excluir sua conta? Se você fizer isso todos os seus dados serão excluidos.')

    if (confirmation) {
        showItem(loading)
        const user = firebase.auth().currentUser

        if (!user) {
            showError('Nenhum usuário autenticado encontrado.')
            hideItem(loading)
            return
        }

        const userId = user.uid

        removeAllTodoAndFiles(userId).then(() => {
            return user.delete()
        }).catch((err) => {
            if (err.code === 'auth/requires-recent-login') {
                reauthenticateUser()
            } else {
                showError('Falha ao excluir conta de usuário: ', err.message || err);
            }
        }).finally(
            hideItem(loading)
        )
    } else {
        console.error("Nenhum usuário autenticado encontrado.");
    }
}

function reauthenticateUser() {
    let user = firebase.auth().currentUser
    let providerId = user.providerData[0].providerId

    if (providerId === 'password') {
        let credentials = promptForEmailPasswordCredentials()
        return user.reauthenticateWithCredential(credentials)
    } else if (providerId === 'google.com') {
        let provider = new firebase.auth.GoogleAuthProvider()
        return user.reauthenticateWithPopup(provider)
    } else if (providerId === 'github.com') {
        let provider = new firebase.auth.GoogleAuthProvider()
        return user.reauthenticateWithPopup(provider)
    }

}
