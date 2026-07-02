import { apiUrl } from './api.js'

const optionalValue = (formData, name) => {
  const value = formData.get(name)?.trim()
  return value || undefined
}

export function initContactForm() {
  const form = document.getElementById('contact-form')
  if (!form) return

  const button = form.querySelector('button[type="submit"]')
  const note = document.getElementById('contact-form-note')
  const defaultButtonText = button.textContent.trim()

  form.addEventListener('submit', async event => {
    event.preventDefault()

    if (!form.reportValidity()) return

    const formData = new FormData(form)
    const payload = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      phone: optionalValue(formData, 'phone'),
      organization: optionalValue(formData, 'organization'),
      subject: optionalValue(formData, 'subject'),
      interest: optionalValue(formData, 'interest'),
      message: formData.get('message').trim(),
    }

    button.disabled = true
    button.textContent = 'Sending…'
    note.className = 'form-note is-pending'
    note.textContent = 'Sending your message…'

    try {
      const response = await fetch(apiUrl('/contact'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        const validationMessage = result.details?.[0]?.message
        throw new Error(validationMessage || result.message || 'Unable to send your message.')
      }

      form.reset()
      note.className = 'form-note is-success'
      note.textContent = result.message || 'Thank you. Your message has been received.'
    } catch (error) {
      note.className = 'form-note is-error'
      note.textContent = error.message || 'Unable to send your message. Please try again.'
    } finally {
      button.disabled = false
      button.textContent = defaultButtonText
    }
  })
}
