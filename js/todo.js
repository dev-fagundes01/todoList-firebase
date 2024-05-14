// Trata a submissão do formulário de tarefas
todoForm.onsubmit = function (e) {
  var nameInput = document.querySelector('.name')
  e.preventDefault();
  if (nameInput.value != "") {
    var data = {
      name: nameInput.value
    }

    dbRefUsers.child(firebase.auth().currentUser.uid).push(data).then(function () {
      console.log(`Tarefa ${data.name} foi adicionada com sucesso`);
    });
  } else {
    alert('O nome da tarefa não poder ser em branco!')
  }
}