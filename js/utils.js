// Definindo referências para elementos da página
let auth = document.querySelector('.auth')
let authForm = document.getElementById('authForm')
let authFormTitle = document.getElementById('authFormTitle')
let register = document.getElementById('register')
let access = document.getElementById('access')
let loading = document.getElementById('loading')
let userContent = document.getElementById('userContent')
let userEmail = document.getElementById('userEmail')
let pEmailVerified = document.getElementById('pEmailVerified')
let sendEmailVerificationDiv = document.getElementById('sendEmailVerificationDiv')
let passwordReset = document.getElementById('passwordReset')
let userImg = document.getElementById('userImg')
let userName = document.getElementById('userName')
let search = document.getElementById('search')
let progressFeedback = document.getElementById('progressFeedback')
let progress = document.getElementById('progress')
let playPauseBtn = document.getElementById('playPauseBtn')
let cancelBtn = document.getElementById('cancelBtn')
let divUpdateTodo = document.getElementById('divUpdateTodo')

let todoForm = document.querySelector('.todoForm')
let submitTodoForm = document.querySelector('.submitTodoForm')
let ulTodoList = document.querySelector('.ulTodoList')
let todoCount = document.querySelector('.todoCount')

// Função que muda o tipo do input de password para text e vice-versa
function togglePasswordVisibility() {
  let showPassword = document.querySelector(".img-showPassword");
  let passwordField = document.getElementById("password");

  if (passwordField.type == 'password') {
    showPassword.src = './img/eye_120221.png'
    passwordField.type = 'text'
  } else if (passwordField.type == 'text') {
    showPassword.src = './img/eye.png'
    passwordField.type = 'password'
  }
}

// Alterar o formulário de autenticação para o cadastro de novas contas
function toggleToRegister() {
  authForm.submitAuthForm.innerHTML = 'Cadastrar conta'
  authFormTitle.innerHTML = 'Insira seus dados para se cadastrar'
  hideItem(register)
  hideItem(passwordReset)
  showItem(access)
}

// Alterar o formulário de autenticação para o acesso de contas já existentes
function toggleToAccess() {
  authForm.submitAuthForm.innerHTML = 'Acessar'
  authFormTitle.innerHTML = 'Acesse a sua conta para continuar'
  hideItem(access)
  showItem(passwordReset)
  showItem(register)
}

// Simplifica a exibição de elementos da página
function showItem(element) {
  element.style.display = 'block'
}

// Simplifica a remoção de elementos da página
function hideItem(element) {
  element.style.display = 'none'
}

function showUserContent(user) {
  if (user.providerData[0].providerId != 'password') {
    pEmailVerified.innerHTML = 'Autenticação por provedor confiável, não é necessário verificar e-mail'
    hideItem(sendEmailVerificationDiv)
  } else {
    if (user.emailVerified) {
      pEmailVerified.innerHTML = 'E-mail verificado'
      hideItem(sendEmailVerificationDiv)
    } else {
      pEmailVerified.innerHTML = 'E-mail não verificado'
      showItem(sendEmailVerificationDiv)
    }
  }
  userImg.src = user.photoURL ? user.photoURL : './../img/unknownUser.png'
  userName.innerHTML = user.displayName

  userEmail.innerHTML = user.email
  hideItem(auth)

  getDefaultTodoList()
  search.onkeyup = function () {
    if (search.value != '') {
      let searchText = search.value.toLowerCase()
      dbFirestore.doc(firebase.auth().currentUser.uid).collection('tarefas')
        .orderBy('nameLowerCase')
        .startAt(searchText).endAt(searchText + '\uf8ff').get().then(function (dataSnapshot) {
          fillTodoList(dataSnapshot)
        })

      // dbRefUsers.child(user.uid)
      // .orderByChild('nameLowerCase')
      // .startAt(searchText).endAt(searchText + '\uf8ff').once('value').then(function (dataSnapshot) {
      //   fillTodoList(dataSnapshot)
      // })
    } else {
      getDefaultTodoList()
    }
  }
  showItem(userContent)
}

// Busca tarefas em tempo real (Listagem padrão usando o on)
function getDefaultTodoList() {
  dbFirestore.doc(firebase.auth().currentUser.uid).collection('tarefas').orderBy('nameLowerCase').onSnapshot(function (dataSnapshot) {
    fillTodoList(dataSnapshot)
  })

  // dbRefUsers.child(firebase.auth().currentUser.uid)
  // .orderByChild('nameLowerCase')
  // .on('value', function (dataSnapshot) {
  //   fillTodoList(dataSnapshot)
  // })
}

// Mostrar conteudo para usuarios não autenticados
function showAuth() {
  authForm.password.value = ''
  authForm.email.value = ''
  hideItem(userContent)
  showItem(auth)
}

function promptForEmailPasswordCredentials() {
  let email = prompt("Por favor, insira seu e-mail:")
  let password = prompt("Por favor, insira seu senha:")

  if (email || password == null) {
    hideItem(loading)
    return
  }
  return firebase.auth.EmailAuthProvider.credential(email, password)
}

// Função que lida com todos os erros
function showError(prefix, err) {
  console.error(err.code);
  console.error(prefix, err);
  alert(`${prefix} ${err}`)

  hideItem(loading)

  switch (err.code) {
    case 'auth/invalid-email': alert(prefix + '' + 'E-mail inválido!')
      break;
    case 'auth/wrong-password':
    case 'auth/internal-error': alert(prefix + '' + 'Senha inválida!')
      break;
    case 'auth/weak-password': alert(prefix + '' + 'Senha deve ter no minimo 6 caracteres!')
      break;
    case 'auth/email-already-in-use': alert(prefix + '' + 'E-mail já está em uso por outra conta!')
      break;
    case 'auth/account-exists-with-different-credential': alert(prefix + '' + 'Já existe uma conta com o mesmo endereço de e-mail, mas com credenciais de login diferentes. Faça login usando um provedor associado a este endereço de e-mail.')
      break;
    case 'auth/popup-closed-by-user': alert(prefix + '' + 'O popup de autenticação foi fechado antes da operação	ser concluida!')
      break;
    case 'auth/requires-recent-login': alert(prefix + '' + 'Esta operação é sensível e requer autenticação recente. Faça login novamente antes de tentar novamente esta solicitação.')
      break;
    case 'storage/canceled':
    case 'storage/unauthorized': alert(prefix + '' + 'Falha ao acessar o Cloud Storage!')
      break;

    default: alert(prefix + '' + err.message)
  }
}

// Atributos extras de configuração de e-mail
let actionCodeSettings = {
  url: 'https://todolist-2c452.firebaseapp.com'
}

let database = firebase.database()
let dbRefUsers = database.ref('users')

let dbFirestore = firebase.firestore().collection('users')