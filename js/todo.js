// Trata a submissão do formulário de tarefas
let nameInput = document.querySelector('.name')
todoForm.onsubmit = function (e) {
  e.preventDefault();
  if (nameInput.value != "") {
    let file = todoForm.file.files[0]
    if (file != null) {
      if (file.size > 1024 * 1024 * 2) {
        alert(`A imagem não pode ser maior do que 2 MB. Imagem selecionada tem: ${(file.size / 1024 / 1024).toFixed(3)} MB`)
        return
      }
      if (file.type.includes('image')) {
        let imgName = firebase.database().ref().push().key + '-' + file.name
        let imgPath = 'todoListFiles/' + firebase.auth().currentUser.uid + '/' + imgName

        let storageRef = firebase.storage().ref(imgPath)
        let upload = storageRef.put(file)

        trackUpload(upload).then(function () {
          storageRef.getDownloadURL().then(function (downloadURL) {
            let data = {
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
      let data = {
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
      progress.value = snapshot.bytesTransferred / snapshot.totalBytes * 100
    }, function (err) {
      hideItem(progressFeedback)
      reject(err)
    }, function () {
      hideItem(progressFeedback)
      resolve()
    })

    let playPauseUpload = true
    playPauseBtn.onclick = function () {
      playPauseUpload = !playPauseUpload;

      if (playPauseUpload) {
        upload.resume()
        playPauseBtn.innerHTML = 'Pausar'
      } else {
        upload.pause()
        playPauseBtn.innerHTML = 'Continuar'
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
  let num = dataSnapshot.size
  // let num = dataSnapshot.numChildren()
  todoCount.innerHTML = num + (num > 1 ? ' Tarefas' : ' Tarefa')
  dataSnapshot.forEach(function (item) {
    let value = item.data()
    let id = item.id
    // let value = item.val()
    // let key = item.key

    let li = document.createElement('li')

    li.id = id
    // li.id = key

    let imgTodo = document.createElement('img')
    imgTodo.src = value.imgUrl ? value.imgUrl : '../img/defaultTodo.png'
    imgTodo.setAttribute('class', 'imgTodo')
    li.appendChild(imgTodo)

    let spanLi = document.createElement('span')
    spanLi.appendChild(document.createTextNode(value.name))
    li.appendChild(spanLi)

    let liRemoveBtn = document.createElement('button')
    liRemoveBtn.appendChild(document.createTextNode('Excluir'))
    liRemoveBtn.setAttribute('onclick', 'removeTodo(\"' + id + '\")')
    liRemoveBtn.setAttribute('class', 'danger todoBtn')
    li.appendChild(liRemoveBtn)

    let liUpdateBtn = document.createElement('button')
    liUpdateBtn.appendChild(document.createTextNode('Editar'))
    liUpdateBtn.setAttribute('onclick', 'updateTodo(\"' + id + '\")')
    liUpdateBtn.setAttribute('class', 'alternative todoBtn')
    li.appendChild(liUpdateBtn)

    ulTodoList.appendChild(li)
  })
}
// Remove tarefas
function removeTodo(key) {
  let idLi = document.querySelector('#' + CSS.escape(key));
  let todoName = idLi.querySelector('span')
  let todoImg = idLi.querySelector('img')
  if (!idLi) {
    console.error('Elemento não encontrado com o id: ', key);
  }
  let removalConfirmation = confirm(`Você realmente deseja remover a tarefa '${todoName.innerHTML}'?`)
  if (removalConfirmation) {
    // dbRefUsers.child(firebase.auth().currentUser.uid).child(key).remove()
    dbFirestore.doc(firebase.auth().currentUser.uid).collection('tarefas').doc(key).delete().then(function () {
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

  let result = imgUrl.indexOf('img/defaultTodo.png')

  if (result === -1) {
    try {
      firebase.storage().refFromURL(imgUrl).delete()
    } catch (err) {
      throw err
    }
  }
}

async function removeAllTodoAndFiles(userId) {
  if (!userId) {
    throw new Error('userId não definido ou vazio.')
  }

  try {
    const tasksQuerySnapshot = await dbFirestore.doc(userId).collection('tarefas').get()

    if (tasksQuerySnapshot.empty) {
      return
    }

    const deletePromises = tasksQuerySnapshot.docs.map(async (doc) => {
      const taskData = doc.data()
      const taskId = doc.id

      await dbFirestore.doc(userId).collection('tarefas').doc(taskId).delete()

      if (taskData.imgUrl) {
        await removeFile(taskData.imgUrl)
      }
    })
    await Promise.all(deletePromises)
  } catch (err) {
    console.error('Erro ao remover tarefas e arquivos: ', err);
    throw err
  }
}

// Atualiza tarefas
let updateTodoKey = null
function updateTodo(key) {
  updateTodoKey = key;
  let todoId = document.querySelector('#' + CSS.escape(key));
  let todoName = todoId.querySelector('span');
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
    let todoImg = document.querySelector('#' + updateTodoKey + '> img');
    let file = todoForm.file.files[0]
    if (file != null) {
      if (file.size > 1024 * 1024 * 2) {
        alert(`A imagem não pode ser maior do que 2 MB. Imagem selecionada tem: ${(file.size / 1024 / 1024).toFixed(3)} MB`)
        return
      }
      if (file.type.includes('image')) {
        let imgName = firebase.database().ref().push().updateTodoKey + '-' + file.name
        let imgPath = 'todoListFiles/' + firebase.auth().currentUser.uid + '/' + imgName

        let storageRef = firebase.storage().ref(imgPath)
        let upload = storageRef.put(file)

        trackUpload(upload).then(function () {
          storageRef.getDownloadURL().then(function (downloadURL) {
            let data = {
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
      let data = {
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
  dbFirestore.doc(firebase.auth().currentUser.uid).collection('tarefas').doc(updateTodoKey).update(data).catch(function (err) {
    showError('Falha ao atualizar tarefa: ', err);
  })
  resetTodoForm()
}