const { execSync } = require('child_process')
const { remote, webFrame } = require('electron')
const Store = require('electron-store')
const os = require('os')

let store = new Store()
let ID = 0

const player = document.getElementById('player')

function alignTable() {
  if(appData.tracks.length == 0) return
  const thElements = document.getElementsByTagName('th')
  const tdElements = document.getElementsByTagName('td')

  for(let i = 0; i < thElements.length; i++) {
  const widerElement = thElements[i].offsetWidth > tdElements[i].offsetWidth ? thElements[i] : tdElements[i]
  const width = window.getComputedStyle(widerElement).width

  thElements[i].style.width = tdElements[i].style.width = width }

  let tdWidth = document.getElementById('track-item-0').children[0].offsetWidth
  document.getElementsByTagName('th')[0].style.width = tdWidth + 'px'

  tdWidth = document.getElementById('track-item-0').children[1].offsetWidth
  document.getElementsByTagName('th')[1].style.width = tdWidth + 'px'

}

function setView(id) {
  if(id == 'mymusic') id = 'main'
  appData.views.forEach(view => document.getElementById(`${view}-view`).style.display = 'none')
  document.getElementById(`${id}-view`).style.display = 'block'
}

/// PLAYER ///////

function nextTrack() {
  appData.tracks = appData.tracks.filter(track => track != null)
  let currentTrack = appData.tracks.filter(track => track.path == appData.currentTrack.path)[0]
  let position = appData.tracks.indexOf(currentTrack) 
  appData.currentTrack = appData.tracks[position+1]
  updateTrackHighlight()
}

function prevTrack() {
  appData.tracks = appData.tracks.filter(track => track != null)
  let currentTrack = appData.tracks.filter(track => track.path == appData.currentTrack.path)[0]
  let position = appData.tracks.indexOf(currentTrack) 
  appData.currentTrack = appData.tracks[position-1]
  updateTrackHighlight()}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
	let j = Math.floor(Math.random() * (i + 1));
	[array[i], array[j]] = [array[j], array[i]];
  }
}

function shuffle() {
  appData.currentTrackList = appData.trackListCount.toString()
  appData[appData.currentTrackList] = appData.tracks
  shuffleArray(appData[appData.currentTrackList])
}

/// CONSTANTS ////


//////////////////

const MUSIC_DIR = os.homedir + '/Music/'

async function fetchMusicFromFolder (folderPath, callback) {
  const fs = require('fs')
  fs.readdir(folderPath, (err, data) => {
	if(err) alert(err)

	data.forEach(file => {
	  const path = require('path')
	  if (path.extname(file) == '.mp3') {

		let data = execSync(`./src/tag "${folderPath+file.replace('\"', '\'')}"`).toString()
		try {
		  let trackObj = JSON.parse(data)

		  trackObj['path'] = folderPath + file

		  if(trackObj.artist == null) trackObj.artist = ' - '
		  if(trackObj.album  == null) trackObj.album  = ' - '
		  if(trackObj.title  == null) trackObj.title = file.split(path.extname(file))[0]
		
		  appData.tracks.push(trackObj)

		} catch (err) {
		  console.log('An image failed to load')
		}
	  }
	})
	callback()
	webFrame.clearCache()
  })
}

function loadAppTracks () {
  document.getElementById('track-list').innerHTML = ''
  appData.tracks.forEach(track => {
	if(track != null) {
	  let src = `data:image/jpeg;base64,${track.image}`
	  document.getElementById('track-list').innerHTML += `<tr id='track-item-${ID}' data-path="${track['path'].replace('\"', "\'")}" class="track-item"><td class="art"><img src='${src.toString()}'/></td><td class="meta">${track.title}</td><td class="meta">${track.artist}</td></tr>`
	  ID++
	}
  })
  alignTable()
  for(let item of document.getElementsByClassName('track-item')) {
	item.addEventListener('click', (event) => {
	  playTrack(item.dataset.path)
	})
  }
  highlightTrack()
  webFrame.clearCache()
}

function setSidebarActive(button) {
  sideBarButtons.forEach(item => {
	if(button == item) {
	  document.getElementById(`sidebar-${item}-button`).style.background = '#3454D1'
	} else {
	  document.getElementById(`sidebar-${item}-button`).style.background = 'none'
	}
  })
}

function initSideBar() {
  sideBarButtons.forEach(button => {
	document.getElementById(`sidebar-${button}-button`).addEventListener('click', (event) => {
	  setView(button)
	  setSidebarActive(button)
	})
  })
}

//// TRACK LIST ////

function highlightTrack(id) {
  let btnContainer = document.getElementById('track-list')
  let btns = btnContainer.getElementsByClassName('track-item')

  for(let i = 0; i < btns.length; i++) {
  btns[i].addEventListener('click', function() {
	let current = document.getElementsByClassName('active')

	if(current.length > 0) {
	current[0].className = current[0].className.replace(' active', '')
	}

	this.className += ' active'
  })
  }
}

////////////////////

function playTrack(path) {
  let data = execSync(`./src/tag "${path.replace('\"', '\'')}"`).toString()
  appData.currentTrack = JSON.parse(data)
  appData.currentTrack['path'] = path
  player.src = path
  player.play()
  writeCoverImage()
  document.getElementsByTagName('title')[0].text = appData.currentTrack.artist + ' - ' + appData.currentTrack.title
  webFrame.clearCache()
}

function initEventListeners() {
  window.addEventListener('resize', () => { alignTable() })
}

function init() {
  if(store.get() != {}) {
	appData.trackListCount = store.get('trackListCount') != null ? store.get('trackListCount')    : 0
	appData.currentTrack   = store.get('currentTrack')   != null ? store.get('currentTrack')      : ''
	appData.sidebar.active = store.get('sidebar.active') != null ? store.get('sidebar.active')    : 'mymusic'
	appData.sources      = store.get('sources')      != null ? JSON.parse(store.get('sources')) : [MUSIC_DIR]
  }
  renderMusicSources()
  
  initSideBar()
  setSidebarActive('mymusic')
  initEventListeners()

  if(appData.currentTrack == null) appData.currentTrack = appData.tracks[0]

  store.set('sources', JSON.stringify(appData.sources))
  saveConfig()
}

function initSettingsView() {
}

function renderMusicSources() {
  appData.sources.forEach(source => fetchMusicFromFolder(source, loadAppTracks))
  document.getElementById('sources-list').innerHTML = ''
  appData.sources.forEach(source => {
	document.getElementById('sources-list').innerHTML += `<a onclick="removeSource('${source}')" class="button is-info source-item" disabled><i class="fa fa-folder pad-icon"></i>${source}</a>`
  })
  saveConfig()
}

document.getElementById('add-source-button').addEventListener('click', (event) => {
  openFolderDialog()
})

async function openFolderDialog() {
  const dialog = remote.dialog
  const result = await dialog.showOpenDialog({
	properties: ['openDirectory']
  })
  if(result.filePaths.length == 0) return
  let folder = result.filePaths[0]
  if(folder[folder.length-1] != '/') folder += '/'
  appData.sources.push(folder)
  renderMusicSources()
  appData.sources.forEach(source => fetchMusicFromFolder(source, loadAppTracks))
}

function saveConfig() {
  store.set('init', true)
  store.set('currentTrack', appData.currentTrack)
  store.set('sidebar.active', appData.sidebar.active)
  store.set('sources', JSON.stringify(appData.sources))
}

function updateTrackHighlight() {
  let track = appData.tracks.filter(track => track.path == appData.currentTrack.path)[0]
  let index = appData.tracks.indexOf(track)
  document.getElementById(`track-item-${index}`).click()
}

function writeCoverImage() {
  let src = `data:${appData.currentTrack.mime};base64,${appData.currentTrack.image}`
  document.getElementById('cover-art').src = src
}

document.getElementById('player').addEventListener('ended', () => {
  nextTrack()
  let notification = new Notification(`${appData.currentTrack.artist} - ${appData.currentTrack.title}`, { 
	body:`${appData.currentTrack.album}`,
	icon:`${document.getElementById('cover-art').src}`
  })
})

document.addEventListener('keydown', (e) => {
  if (e.key == 'c') {
	webFrame.clearCache()
  }
})

function removeSource(source) {
  alert('Folder : ' + source + ' removed from source list')
  appData.sources = appData.sources.filter(s => s != source)
  appData.sources.forEach(source => fetchMusicFromFolder(source, loadAppTracks))
  renderMusicSources()
  saveConfig()
}

init()


