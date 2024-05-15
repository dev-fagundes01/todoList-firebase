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
    }).catch(function (err) {
      showError('Falha ao adicionar tarefa: ', err);
    })
  } else {
    alert('O nome da tarefa não poder ser em branco!')
  }
}

// Exibe a lista de tarefas do usuário
function fillTodoList(dataSnapshot) {
  ulTodoList.innerHTML = ''
  var num = dataSnapshot.numChildren()
  todoCount.innerHTML = num + (num > 1 ? ' Tarefas' : ' Tarefa')
  dataSnapshot.forEach(function (item) {
    var value = item.val()
    var li = document.createElement('li')
    var spanLi = document.createElement('spanLi')
    spanLi.appendChild(document.createTextNode(value.name))
    li.appendChild(spanLi)
    ulTodoList.appendChild(li)
  })
}