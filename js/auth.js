// Traduz para português brasileiro a autenticação do firebase
firebase.auth().languageCode = 'pt-BR'

// Função que trata a submissão do formulario de autenticação
authForm.onsubmit = function (e) {
    showItem(loading)
    e.preventDefault();
    if (authForm.submitAuthForm.innerHTML === 'Acessar') {
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
    firebase.auth().signOut().catch(function (error) {
        console.log('falha ao sair da conta');
        console.log();
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
        console.log({ first })
    }).finally(function () { hideItem(loading) })
}

// Função que permite o usuário redefinir a senha dele
function sendPasswordResetEmail() {
    var email = prompt('Redefinir senha! Informe o seu endereço de e-mail.', authForm.email.value);
    if (email) {
        showItem(loading);
        firebase.auth().sendPasswordResetEmail(email, actionCodeSettings).then(function () {
            alert('E-mail de redefinição de foi enviado para' + email + '.') ;
        }).catch(function (err) {
            alert('Houve um erro ao enviar e-mail de redefinição de senha!')
            console.log(err) ;
        }).finally(function () {
            hideItem(loading)
        })
    } else {
        alert('É preciso preencher o campo de e-mail para redefinir senha.')
    }
}