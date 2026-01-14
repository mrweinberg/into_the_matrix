export function replaceSymbols(text) {
  if (!text) return ""
  return text
    .replace(/{([WUBRG])\/([WUBRG])}/gi, (match, c1, c2) =>
      `<i class="ms ms-${c1.toLowerCase()}${c2.toLowerCase()} ms-cost"></i>`)
    .replace(/{([WUBRG])\/P}/gi, (match, c1) =>
      `<i class="ms ms-p${c1.toLowerCase()} ms-cost"></i>`)
    .replace(/{2\/([WUBRG])}/gi, (match, c1) =>
      `<i class="ms ms-2${c1.toLowerCase()} ms-cost"></i>`)
    .replace(/{W}/g, '<i class="ms ms-w ms-cost"></i>')
    .replace(/{U}/g, '<i class="ms ms-u ms-cost"></i>')
    .replace(/{B}/g, '<i class="ms ms-b ms-cost"></i>')
    .replace(/{R}/g, '<i class="ms ms-r ms-cost"></i>')
    .replace(/{G}/g, '<i class="ms ms-g ms-cost"></i>')
    .replace(/{C}/g, '<i class="ms ms-c ms-cost"></i>')
    .replace(/{E}/g, '<i class="ms ms-e ms-cost"></i>')
    .replace(/{T}/g, '<i class="ms ms-tap ms-cost"></i>')
    .replace(/{Q}/g, '<i class="ms ms-untap ms-cost"></i>')
    .replace(/{S}/g, '<i class="ms ms-s ms-cost"></i>')
    .replace(/{X}/g, '<i class="ms ms-x ms-cost"></i>')
    .replace(/{(\d+)}/g, '<i class="ms ms-$1 ms-cost"></i>')
}
