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
    var spanLi = document.createElement('span')
    spanLi.appendChild(document.createTextNode(value.name))
    spanLi.id = value.key
    li.appendChild(spanLi)

    var liRemoveBtn = document.createElement('button')
    liRemoveBtn.appendChild(document.createTextNode('Excluir'))
    liRemoveBtn.setAttribute('onclick', 'removeTodo(\"' + item.key + '\")')
    liRemoveBtn.setAttribute('class', 'danger todoBtn')
    li.appendChild(liRemoveBtn)
    
    ulTodoList.appendChild(li)
  })
}
// Remove tarefas
function removeTodo(key) {
  var idLi = document.getElementById(key.value)
  var removalConfirmation = confirm(`Você realmente deseja remover a tarefa '${idLi.innerHTML}'?`)
  if(removalConfirmation) {
    dbRefUsers.child(firebase.auth().currentUser.uid).child(key).remove().catch(function (err) {
      showError('Falha ao remover tarefa: ', err);
    })
  }
}