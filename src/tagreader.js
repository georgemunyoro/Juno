const { exec } = require('child_process')

const readMP3File = (filePath) => {
  exec(`./tag "${filePath.replace('\"', '\'')}"`, (err, stdout, stderr) => {
	if (err) return
	console.log('sd')
  })
  return 'sdappData'
}

module.exports = {
  readMP3File: readMP3File
}
