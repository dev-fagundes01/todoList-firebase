// Trata a submissão do formulário de tarefas
todoForm.onsubmit = function (e) {
  var nameInput = document.querySelector('.name')
  e.preventDefault();
  if (nameInput.value != "") {
    var file = todoForm.file.files[0]
    if (file != null) {
      if (file.type.includes('image')) {
        var imgName = firebase.database().ref().push().key + '-' + file.name
        var imgPath = 'todoListFiles/' + firebase.auth().currentUser.uid + '/' + imgName

        var storageRef = firebase.storage().ref(imgPath)
        var upload = storageRef.put(file)

        trackUpload(upload).then(function () {
          storageRef.getDownloadURL().then(function (downloadURL) {
            var data = {
              imgUrl: downloadURL,
              name: nameInput.value,
              nameLowerCase: nameInput.value.toLowerCase()
            }
        
            dbRefUsers.child(firebase.auth().currentUser.uid).push(data).then(function () {
              console.log(`Tarefa ${data.name} foi adicionada com sucesso`);
              nameInput.value = ''
              todoForm.file.value = ''
            }).catch(function (err) {
              showError('Falha ao adicionar tarefa (use no máximo 30 caracteres): ', err);
            })            
          })
        }).catch(function (err) {
          showError('Falha ao adicionar tarefa: ', err);
        })
      } else {
        alert('O arquivo selecionado precisa ser uma imagem. Tente novamente.')
      }
    } else {
      var data = {
        name: nameInput.value,
        nameLowerCase: nameInput.value.toLowerCase()
      }
  
      dbRefUsers.child(firebase.auth().currentUser.uid).push(data).then(function () {
        console.log(`Tarefa ${data.name} foi adicionada com sucesso`);
        nameInput.value = ''
      }).catch(function (err) {
        showError('Falha ao adicionar tarefa: ', err);
      })
    }
  } else {
    alert('O nome da tarefa não poder ser em branco!')
  }
}

// Rastreia a progresso de upload
function trackUpload(upload) {
  return new Promise(function (resolve, reject) {
    showItem(progressFeedback)
    upload.on('state_changed', function (snapshot) {
      console.log((snapshot.bytesTransferred / snapshot.totalBytes * 100).toFixed(2) + '%');
      progress.value = snapshot.bytesTransferred / snapshot.totalBytes * 100
    }, function (err) {
      hideItem(progressFeedback)
      reject(err)
    }, function () {
      console.log('Sucesso no upload');
      hideItem(progressFeedback)
      resolve()
    })

    var playPauseUpload = true
    playPauseBtn.onclick = function () {
      playPauseUpload = !playPauseUpload;

      if (playPauseUpload) {
        upload.resume()
        playPauseBtn.innerHTML = 'Pausar'
        console.log('Upload retomado');
      } else {
        upload.pause()
        playPauseBtn.innerHTML = 'Continuar'
        console.log('upload pausado');
      }
    }

    cancelBtn.onclick = function () {
      upload.cancel()
      hideItem(progressFeedback)
    }
  })
}

// Exibe a lista de tarefas do usuário
function fillTodoList(dataSnapshot) {
  ulTodoList.innerHTML = ''
  var num = dataSnapshot.numChildren()
  todoCount.innerHTML = num + (num > 1 ? ' Tarefas' : ' Tarefa')
  dataSnapshot.forEach(function (item) {
    var value = item.val()
    var key = item.key

    var li = document.createElement('li')
    var spanLi = document.createElement('span')
    spanLi.appendChild(document.createTextNode(value.name))
    spanLi.id = key
    li.appendChild(spanLi)

    var liRemoveBtn = document.createElement('button')
    liRemoveBtn.appendChild(document.createTextNode('Excluir'))
    liRemoveBtn.setAttribute('onclick', 'removeTodo(\"' + key + '\")')
    liRemoveBtn.setAttribute('class', 'danger todoBtn')
    li.appendChild(liRemoveBtn)

    var liUpdateBtn = document.createElement('button')
    liUpdateBtn.appendChild(document.createTextNode('Editar'))
    liUpdateBtn.setAttribute('onclick', 'updateTodo(\"' + key + '\")')
    liUpdateBtn.setAttribute('class', 'alternative todoBtn')
    li.appendChild(liUpdateBtn)

    ulTodoList.appendChild(li)
  })
}
// Remove tarefas
function removeTodo(key) {
  var idLi = document.getElementById(key);
  if (!idLi) {
    console.error('Elemento não encontrado com o id: ', key);
  }
  console.log(idLi);
  var removalConfirmation = confirm(`Você realmente deseja remover a tarefa '${idLi.innerHTML}'?`)
  if (removalConfirmation) {
    dbRefUsers.child(firebase.auth().currentUser.uid).child(key).remove().catch(function (err) {
      showError('Falha ao remover tarefa: ', err);
    })
  }
}

// Atualiza tarefas
function updateTodo(key) {
  var selectedItem = document.getElementById(key);
  if (!idLi) {
    console.error('Elemento não encontrado com o id: ', key);
  }
  var newTodoName = prompt(`Escolha um novo nome para a tarefa '${selectedItem.innerHTML}'`, selectedItem.innerHTML)
  if (newTodoName != '') {
    var data = {
      name: newTodoName,
      nameLowerCase: newTodoName.toLowerCase()
    }
    dbRefUsers.child(firebase.auth().currentUser.uid).child(key).update(data).then(function () {
      console.log(`Tarefa ${data.name} atualizada com sucesso`);
    }).catch(function (err) {
      showError('Falha ao atualizar tarefa: ', err);
    })
  } else {
    alert('O nome da tarefa não pode ser em branco para atualizar a tarefa')
  }
}