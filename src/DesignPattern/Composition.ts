/**
 * @description 组合模式
 * @example 文件夹扫描、React 组件渲染
 */

class MyFile {
  name: string
  parent!: Folder
  constructor(name: string) {
    this.name = name
  }

  scan() {
    console.log('file:', this.name)
  }
}

class Folder {
  name: string
  parent!: Folder
  files: Array<MyFile>
  constructor(name: string) {
    this.name = name
    this.files = []
  }

  add(file: MyFile) {
    file.parent = this
    this.files.push(file)
  }

  scan() {
    console.log('Start scaning folder...', this?.parent?.name || 'global', '->', this.name)
    this.files.forEach((item) => {
      item.scan()
    })
  }
}

const root = new Folder('downloads')

const images = new Folder('images')
const musics = new Folder('musics')
const books = new Folder('books')

const images1 = new MyFile('background.png')
const musics1 = new MyFile('500 miles.mp3')
const musics2 = new MyFile('Canon 卡农 D大调.mp3')
const book1 = new MyFile('C++ 从入门到放弃')
const book2 = new MyFile('PHP 世界上最好的编程语言')
const book3 = new MyFile('JavaScript 百炼成仙')

root.add(images)
root.add(musics)
root.add(books)

images.add(images1)
musics.add(musics1)
musics.add(musics2)
books.add(book1)
books.add(book2)
books.add(book3)

root.scan()

// 组合模式
// 用小的对象来组合成一个大的对象（react用小的组件来组合页面）
// 组合模式不是父子关系，组合模式不是真正意义上的父子关系，只是口头上我们习惯把树的上下级的关系称之父子关系
// 可以用责任链模式提高组合模式的性能，让请求顺着联调传递知道找到可以处理当前请求的对象为止
