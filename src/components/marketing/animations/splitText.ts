export function splitIntoWords(element: HTMLElement): HTMLSpanElement[] {
  const text = element.textContent ?? ''
  element.textContent = ''

  const words = text.split(' ').map((word, i, arr) => {
    const span = document.createElement('span')
    span.textContent = word
    span.style.display = 'inline-block'
    element.appendChild(span)
    if (i < arr.length - 1) element.appendChild(document.createTextNode(' '))
    return span
  })

  return words
}

export function splitIntoChars(element: HTMLElement): HTMLSpanElement[] {
  const text = element.textContent ?? ''
  element.textContent = ''

  return [...text].map(char => {
    const span = document.createElement('span')
    span.textContent = char === ' ' ? '\u00A0' : char
    span.style.display = 'inline-block'
    element.appendChild(span)
    return span
  })
}

export function revertSplit(element: HTMLElement, originalText: string): void {
  element.textContent = originalText
}

export function splitTextToSpans(element: HTMLElement, type: 'chars' | 'words' | 'lines' = 'chars'): HTMLSpanElement[] {
  if (type === 'chars') return splitIntoChars(element)
  return splitIntoWords(element)
}
