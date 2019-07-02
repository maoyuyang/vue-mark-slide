const fs = require('fs-extra')
const path = require('path')

const { parse, enhanceMarked, parseForTest } = require('../parser')
// const parser2 = require('../parser2')

function getFragment(name) {
  const file = path.join(__dirname, 'fragments', name)
  return fs.readFileSync(file, 'utf-8')
}

describe('parser', () => {
  const code = getFragment('ppt.md')

  test('should get correct page numbers', () => {
    const output = parse(code)
    expect(output.length).toBe(2)
  })

  test('should has correct properties', () => {
    const output = parse(code)
    expect(output[0]).toHaveProperty('html')
    expect(output[0]).toHaveProperty('meta')
    expect(output[0]).toHaveProperty('meta.type', 'cover')
    expect(output[0]).toHaveProperty('meta.title', 'Hello world')
    expect(output[0]).toHaveProperty('tokens')

    expect(output[1]).toHaveProperty('html')
    expect(output[1]).toHaveProperty('meta')
    expect(output[1]).not.toHaveProperty('meta.type')
    expect(output[1]).toHaveProperty('meta.title', 'this is content')
    expect(output[1]).toHaveProperty('tokens')
  })

  test('should enhance marked', () => {
    enhanceMarked((marked) => {
      const mRenderer = new marked.Renderer()
      // Override function
      mRenderer.heading = function (text, level) {
        const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-')

        return `
          <h${level}>
            <a name="${escapedText}" class="anchor" href="#${escapedText}">
              <span class="header-link"></span>
            </a>
            ${text}
          </h${level}>`
      }

      marked.setOptions({
        renderer: mRenderer
      })
    })

    const input = '# head'
    const output = parseForTest(input)

    expect(output).toMatchSnapshot()
  })
})
