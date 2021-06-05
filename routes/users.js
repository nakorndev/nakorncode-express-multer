const _ = require('lodash')
const users = require('../data/users.json')

const router = require('express-async-router').AsyncRouter()

router.get('/', (req, res) => {
  const page = Number(req.query.page) || 1
  const perPage = Number(req.query.per_page) || 30
  const offset = (page - 1) * perPage
  return res.render('users-index.pug', {
    users: _.slice(users, offset, offset + perPage)
  })
})

router.get('/:id', (req, res) => {
  const id = Number(req.params.id)
  const user = _.find(users, { id })
  if (!user) {
    res.status(404)
    return res.send({ message: 'user not found' })
  }
  return res.render('users-show.pug', { user })
})

router.get('/:id/edit', (req, res) => {
  const id = Number(req.params.id)
  const user = _.find(users, { id })
  if (!user) {
    res.status(404)
    return res.send({ message: 'user not found' })
  }
  return res.render('users-edit.pug', { user })
})

const multer = require('multer')
const path = require('path')
const sharp = require('sharp')
const uploadAvatar = multer({
  dest: path.resolve(__dirname, '../data/temp')
}) // multipart/form-data

router.put('/:id', uploadAvatar.single('avatar'), async (req, res) => {
  if (req.file) {
    const avatarPath = path.resolve(__dirname, '../static/avatars', req.file.filename + '.jpeg')
    await sharp(req.file.path)
      .resize(150, 150)
      .jpeg({ quality: 80 })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .toFile(avatarPath)
    Object.assign(req.body, { avatar: `/avatars/${req.file.filename}.jpeg` })
  }
  const id = Number(req.params.id)
  const index = _.findIndex(users, { id })
  users[index] = { id, ...req.body }
  return res.redirect(`/users/${id}`)
})

module.exports = router
