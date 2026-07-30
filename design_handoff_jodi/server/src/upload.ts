import crypto from 'node:crypto'
import path from 'node:path'
import multer from 'multer'

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads')

function storageFor(subdir: string) {
  return multer.diskStorage({
    destination: path.join(UPLOAD_ROOT, subdir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ''
      cb(null, `${crypto.randomUUID()}${ext}`)
    },
  })
}

export const uploadPhoto = multer({
  storage: storageFor('photos'),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'))
  },
})

export const uploadVoice = multer({
  storage: storageFor('voice'),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('audio/'))
  },
})

export { UPLOAD_ROOT }
