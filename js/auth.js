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

// função que centraliza e trata autenticação
firebase.auth().onAuthStateChanged(function (user) {
    hideItem(loading)
    if (user) {
        showUserContent(user)
    } else {
        showAuth()
    }
})

// função que permite ao usuário sair da conta dele
function signOut() {
    firebase.auth().signOut().catch(function (error) {
        console.log('falha ao sair da conta');
        console.log();
    })
}

// função que permite ao usuario  fazer a verificação do e-mail
function sendEmailVerification() {
    showItem(loading)
    var user = firebase.auth().currentUser
    user.sendEmailVerification().then(function () {
        alert('E-mail de verificação foi enviado para ' + user.email + '! Verifique sua caixa de entrada')
    }).catch(function (err) {
        alert('Houve um erro ao enviar o e-mail de verificação')
        console.table({ first })
    }).finally(function () { hideItem(loading) })
}