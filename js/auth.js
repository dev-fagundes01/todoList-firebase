// Traduz para português brasileiro a autenticação do firebase
firebase.auth().languageCode = 'pt-BR'

// Função que trata a submissão do formulario de autenticação
authForm.onsubmit = function (e) {
    showItem(loading)
    e.preventDefault();
    if(authForm.email.value === '' || authForm.password.value === '') {
        alert('Os campos E-mail e Senha deve ser preenchidos')
        hideItem(loading)
    } else if (authForm.submitAuthForm.innerHTML === 'Acessar') {
        firebase.auth().signInWithEmailAndPassword(authForm.email.value, authForm.password.value).catch(function (error) {
            console.log('Falha no acesso');
            console.log(error);
            hideItem(loading)
        })
    } else {
        firebase.auth().createUserWithEmailAndPassword(authForm.email.value, authForm.password.value).catch(function (error) {
            console.log('Falha no Cadastro');
            console.log(error);
            hideItem(loading)
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
        console.log('falha ao sair da conta');
    })
}

// Função que permite ao usuario  fazer a verificação do e-mail
function sendEmailVerification() {
    showItem(loading)
    var user = firebase.auth().currentUser
    user.sendEmailVerification(actionCodeSettings).then(function () {
        alert('E-mail de verificação foi enviado para ' + user.email + '! Verifique sua caixa de entrada')
    }).catch(function (err) {
        alert('Houve um erro ao enviar o e-mail de verificação')
        console.log({ user })
    }).finally(function () { hideItem(loading) })
}

// Função que permite o usuário redefinir a senha dele
function sendPasswordResetEmail() {
    var email = prompt('Redefinir senha! Informe o seu endereço de e-mail.', authForm.email.value);
    if (email) {
        showItem(loading);
        firebase.auth().sendPasswordResetEmail(email, actionCodeSettings).then(function () {
            alert('E-mail de redefinição de foi enviado para' + email + '.');
        }).catch(function (err) {
            alert('Houve um erro ao enviar e-mail de redefinição de senha!')
            console.log(err);
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
        console.log({ err });
        hideItem(loading)
    })
}

// Função que permite a autenticação pelo GitHUb
function signInWithGitHub() {
    showItem(loading)
    firebase.auth().signInWithPopup(new firebase.auth.GithubAuthProvider()).catch(function (err) {
        alert('Houve um erro ao autenticar usando o GitHUb')
        console.log({ err });
        hideItem(loading)
    })
}

// Função que permite a autenticação pelo Facebook
function signInWithFacebook() {
    showItem(loading)
    firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider()).catch(function (err) {
        alert('Houve um erro ao autenticar usando o Facebook')
        console.log({ err });
        hideItem(loading)
    })
}

// Função que permite atualizar nomes de usuarios
function updateUserName() {
    var newUserName = prompt('Informe um novo nome de usuário.', userName.innerHTML)
    if (newUserName && newUserName != '') {
        userName.innerHTML = newUserName
        showItem(loading)
        firebase.auth().currentUser.updateProfile({
            displayName: newUserName
        }).catch(function (err) {
            alert('Houve um erro ao atualizado o nome de usuário')
            console.log({ err })
        }).finally(function () { hideItem(loading) })
    } else {
        alert('O nome de usuário não pode ser vazio')
    }
}

// Função que permite remover contas de usuarios
function deleteCount() {
    var confirmation = confirm('Realmente deseja excluir sua conta?')

    if (confirmation) {
        showItem(loading)
        firebase.auth().currentUser.delete()
            .then(() => {
                console.log("Conta de usuário excluída com sucesso.");
            })
            .catch((error) => {
                console.error("Erro ao excluir conta de usuário:", error.message);
            }).finally(
                hideItem(loading)
            )
    } else {
        console.error("Nenhum usuário autenticado encontrado.");
    }

}