// Trata a submissão do formulário de tarefas
var nameInput = document.querySelector('.name')
todoForm.onsubmit = function (e) {
  e.preventDefault();
  if (nameInput.value != "") {
    var file = todoForm.file.files[0]
    if (file != null) {
      if (file.size > 1024 * 1024 * 2) {
        alert(`A imagem não pode ser maior do que 2 MB. Imagem selecionada tem: ${(file.size / 1024 / 1024).toFixed(3)} MB`)
        return
      }
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
            completeTodoCreate(data)
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
      completeTodoCreate(data)
    }
  } else {
    alert('O nome da tarefa não poder ser em branco!')
  }
}

function completeTodoCreate(data) {
  // dbRefUsers.child(firebase.auth().currentUser.uid).push(data)
  dbFirestore.doc(firebase.auth().currentUser.uid).collection('tarefas').add(data).then(function () {
    console.log(`Tarefa ${data.name} foi adicionada com sucesso`);
    nameInput.value = ''
    todoForm.file.value = ''
  }).catch(function (err) {
    showError('Falha ao adicionar tarefa (use no máximo 30 caracteres): ', err);
  })

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
      showItem(divUpdateTodo)
    }
  })
}

// Exibe a lista de tarefas do usuário
function fillTodoList(dataSnapshot) {
  ulTodoList.innerHTML = ''
  var num = dataSnapshot.size
  // var num = dataSnapshot.numChildren()
  todoCount.innerHTML = num + (num > 1 ? ' Tarefas' : ' Tarefa')
  dataSnapshot.forEach(function (item) {
    var value = item.data()
    var id = item.id
    // var value = item.val()
    // var key = item.key

    var li = document.createElement('li')

    li.id = id
    // li.id = key

    var imgTodo = document.createElement('img')
    imgTodo.src = value.imgUrl ? value.imgUrl : '../img/defaultTodo.png'
    imgTodo.setAttribute('class', 'imgTodo')
    li.appendChild(imgTodo)

    var spanLi = document.createElement('span')
    spanLi.appendChild(document.createTextNode(value.name))
    li.appendChild(spanLi)

    var liRemoveBtn = document.createElement('button')
    liRemoveBtn.appendChild(document.createTextNode('Excluir'))
    liRemoveBtn.setAttribute('onclick', 'removeTodo(\"' + id + '\")')
    liRemoveBtn.setAttribute('class', 'danger todoBtn')
    li.appendChild(liRemoveBtn)

    var liUpdateBtn = document.createElement('button')
    liUpdateBtn.appendChild(document.createTextNode('Editar'))
    liUpdateBtn.setAttribute('onclick', 'updateTodo(\"' + id + '\")')
    liUpdateBtn.setAttribute('class', 'alternative todoBtn')
    li.appendChild(liUpdateBtn)

    ulTodoList.appendChild(li)
  })
}
// Remove tarefas
function removeTodo(key) {
  var idLi = document.querySelector('#' + CSS.escape(key));
  var todoName = idLi.querySelector('span')
  var todoImg = idLi.querySelector('img')
  if (!idLi) {
    console.error('Elemento não encontrado com o id: ', key);
  }
  var removalConfirmation = confirm(`Você realmente deseja remover a tarefa '${todoName.innerHTML}'?`)
  if (removalConfirmation) {
    // dbRefUsers.child(firebase.auth().currentUser.uid).child(key).remove()
    dbFirestore.doc(firebase.auth().currentUser.uid).collection('tarefas').doc(key).delete().then(function () {
      console.log(`Tarefa ${todoName.innerHTML} removida com sucesso`)
      removeFile(todoImg.src)
    })
      .catch(function (err) {
        showError('Falha ao remover tarefa: ', err);
      })
  }
}

// Remove arquivos
async function removeFile(imgUrl) {
  if (!imgUrl) {
    throw new Error('imgUrl não definido ou vazio.')
  }

  console.log(`Removendo arquivo: ${imgUrl}`)
  var result = imgUrl.indexOf('img/defaultTodo.png')

  if (result === -1) {
    try {
      firebase.storage().refFromURL(imgUrl).delete()
      console.log('arquivo removido com sucesso')
    } catch (err) {
      console.log('Falha ao remover arquivo')
      console.log(err)
      throw err
    }
  } else {
    console.log('img padrão removida da tarefa');
  }
}

async function removeAllTodoAndFiles(userId) {
  if (!userId) {
    throw new Error('userId não definido ou vazio.')
  }

  try {
    const tasksQuerySnapshot = await dbFirestore.doc(userId).collection('tarefas').get()

    if (tasksQuerySnapshot.empty) {
      console.log('Nenhuma tarefa encontrada para o usuário.')
      return
    }

    const deletePromises = tasksQuerySnapshot.docs.map(async (doc) => {
      const taskData = doc.data()
      const taskId = doc.id

      console.log(`Removendo tarefa: ${taskData.name}`)
      await dbFirestore.doc(userId).collection('tarefas').doc(taskId).delete()

      if (taskData.imgUrl) {
        await removeFile(taskData.imgUrl)
      }
    })
    await Promise.all(deletePromises)
    console.log('Todas as tarefas e arquivos foram removidos.');
  } catch (err) {
    console.error('Erro ao remover tarefas e arquivos: ', err);
    throw err
  }
}

// Atualiza tarefas
var updateTodoKey = null
function updateTodo(key) {
  updateTodoKey = key;
  var todoId = document.querySelector('#' + CSS.escape(key));
  var todoName = todoId.querySelector('span');
  todoFormTitle.innerHTML = '<strong>Editar a tarefa:</strong> ' + todoName.innerHTML
  nameInput.value = todoName.innerHTML;
  hideItem(submitTodoForm)
  showItem(divUpdateTodo)
}

function resetTodoForm() {
  todoFormTitle.innerHTML = 'Adicionar tarefa:'
  hideItem(divUpdateTodo)
  submitTodoForm.style.display = 'initial'
  nameInput.value = ''
  todoForm.file.value = ''
}

function confirmTodoUpdate() {
  hideItem(divUpdateTodo)

  if (nameInput.value != "") {
    var todoImg = document.querySelector('#' + updateTodoKey + '> img');
    var file = todoForm.file.files[0]
    if (file != null) {
      if (file.size > 1024 * 1024 * 2) {
        alert(`A imagem não pode ser maior do que 2 MB. Imagem selecionada tem: ${(file.size / 1024 / 1024).toFixed(3)} MB`)
        return
      }
      if (file.type.includes('image')) {
        var imgName = firebase.database().ref().push().updateTodoKey + '-' + file.name
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
            completeTodoUpdate(data);
            removeFile(todoImg.src)
          })
        }).catch(function (err) {
          showError('Falha ao atualizar tarefa: ', err);
        })
      } else {
        alert('O arquivo selecionado precisa ser uma imagem. Tente novamente.')
      }
    } else {
      var data = {
        name: nameInput.value,
        nameLowerCase: nameInput.value.toLowerCase()
      }
      completeTodoUpdate(data)
    }
  } else {
    alert('O nome da tarefa não poder ser em vazio!')
  }
}

function completeTodoUpdate(data) {
  // dbRefUsers.child(firebase.auth().currentUser.uid).child(updateTodoKey).update(data)
  dbFirestore.doc(firebase.auth().currentUser.uid).collection('tarefas').doc(updateTodoKey).update(data).then(function () {
    console.log(`Tarefa ${data.name} atualizada com sucesso`);
  }).catch(function (err) {
    showError('Falha ao atualizar tarefa: ', err);
  })
  resetTodoForm()
}