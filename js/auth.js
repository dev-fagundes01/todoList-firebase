authForm.onsubmit = function (e) {
    showItem(loading)
    e.preventDefault();
    if (authForm.submitAuthForm.innerHTML === 'Acessar') {
        firebase.auth().signInWithEmailAndPassword(authForm.email.value, authForm.password.value).catch(function (error) {
            console.log('Falha no acesso');
            console.log(error);
        })
    } else {
        firebase.auth().createUserWithEmailAndPassword(authForm.email.value, authForm.password.value).catch(function (error) {
            console.log('Falha no Cadastro');
            console.log(error);
        })
    }
}

firebase.auth().onAuthStateChanged(function (user) {
    hideItem(loading)
    if (user) {
        console.log('Usuário ao autenticado');
        console.log(user);
    } else {
        console.log('Usuário nâo Autenticado');
    }
})