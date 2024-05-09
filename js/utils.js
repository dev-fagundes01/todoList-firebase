// Defindo referências para elementos da página
var authForm = document.getElementById('authForm')
var authFormTitle = document.getElementById('authFormTitle')
var register = document.getElementById('register')
var access = document.getElementById('access')
var loading = document.getElementById('loading')
var userContent = document.getElementById('userContent')
var auth = document.getElementById('auth')
var userEmail = document.getElementById('userEmail')
var pEmailVerified = document.getElementById('pEmailVerified')
var sendEmailVerificationDiv = document.getElementById('sendEmailVerificationDiv')

// Alterar o formulário de autenticação para o cadastro de novas contas
function toggleToRegister() {
  authForm.submitAuthForm.innerHTML = 'Cadastrar conta'
  authFormTitle.innerHTML = 'Insira seus dados para se cadastrar'
  hideItem(register)
  showItem(access)
}

// Alterar o formulário de autenticação para o acesso de contas já existentes
function toggleToAccess() {
  authForm.submitAuthForm.innerHTML = 'Acessar'
  authFormTitle.innerHTML = 'Acesse a sua conta para continuar'
  hideItem(access)
  showItem(register)
}

// Simpplifica a exibição de elementos da página
function showItem(element) {
  element.style.display = 'block'
}

// Simpplifica a remoção de elementos da página
function hideItem(element) {
  element.style.display = 'none'
}

function showUserContent(user) {
  console.table({user});
  if(user.emailVerified) {
    pEmailVerified.innerHTML = 'E-mail verificado'
    hideItem(sendEmailVerificationDiv)
  } else {
    pEmailVerified.innerHTML = 'E-mail não verificado'
    showItem(sendEmailVerificationDiv)
  }
  userEmail.innerHTML = user.email
  hideItem(auth)
  showItem(userContent)
}

function showAuth() {
  authForm.password.value = ''
  authForm.email.value = ''
  hideItem(userContent)
  showItem(auth)
}