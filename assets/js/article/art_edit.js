$(function () {
  var layer = layui.layer
  var form = layui.form

  // 1. 初始化图片裁剪器
  var $image = $('#image')
  // 2. 裁剪选项
  var options = {
    aspectRatio: 400 / 280,
    preview: '.img-preview',
    autoCropArea: 1 // 初始化图片裁剪框的大小
  }

  // location.search得到url中的查询参数， 格式为：?id=31302
  var search = location.search.split('=')
  var id = search[1]

  initCate()

  // 定义加载文章分类的方法
  function initCate() {
    $.ajax({
      method: 'GET',
      url: '/my/article/cates',
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('初始化文章分类失败！')
        }
        // 调用模板引擎，渲染分类的下拉菜单
        var htmlStr = template('tpl-cate', res)
        $('[name=cate_id]').html(htmlStr)
        // 一定要记得调用 form.render() 方法
        form.render()

        // 分类数据初始化完成之后，再加载文章详细数据
        // 如果提前加载，可能导致下拉选择框无法选中当前文章分类
        initArticle()
      }
    })
  }

  // 初始化文章数据
  function initArticle() {
    $.ajax({
      url: "/my/article/" + id,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('初始化文章数据失败！')
        }
        console.log(res)
        form.val('form-edit', res.data)

        // 初始化富文本编辑器
        initEditor()
        // 初始化裁剪区域
        // 必须获取完文章数据之后才能够初始化，确保在裁剪区域展示原始文章封面
        initImage(res.data.cover_img)
      }
    });
  }

  // 初始化裁剪区域
  function initImage(path) {
    // 如果存在图片路径，就将路径设置给img标签
    if (path) {
      $image.attr('src', 'http://ajax.frontend.itheima.net' + path)
    }
    // 3. 初始化裁剪区域
    $image.cropper(options)
  }

  // 为选择封面的按钮，绑定点击事件处理函数
  $('#btnChooseImage').on('click', function () {
    $('#coverFile').click()
  })

  // 监听 coverFile 的 change 事件，获取用户选择的文件列表
  $('#coverFile').on('change', function (e) {
    // 获取到文件的列表数组
    var files = e.target.files
    // 判断用户是否选择了文件
    if (files.length === 0) {
      return
    }
    // 根据文件，创建对应的 URL 地址
    var newImgURL = URL.createObjectURL(files[0])
    // 为裁剪区域重新设置图片
    $image
      .cropper('destroy') // 销毁旧的裁剪区域
      .attr('src', newImgURL) // 重新设置图片路径
      .cropper(options) // 重新初始化裁剪区域
  })

  // 定义文章的发布状态
  var art_state = '已发布'

  // 为存为草稿按钮，绑定点击事件处理函数
  $('#btnSave2').on('click', function () {
    art_state = '草稿'
  })

  // 为表单绑定 submit 提交事件
  $('#form-edit').on('submit', function (e) {
    // 1. 阻止表单的默认提交行为
    e.preventDefault()
    // 2. 基于 form 表单，快速创建一个 FormData 对象
    var fd = new FormData($(this)[0])
    // 3. 将文章的发布状态，存到 fd 中
    fd.append('state', art_state)
    // Bug: 通过FormData拿到的富文本编辑器数据是旧数据，需要使用tinymce手动获取最新数据
    fd.append('content', tinymce.activeEditor.getContent())

    // 4. 将封面裁剪过后的图片，输出为一个文件对象
    $image
      .cropper('getCroppedCanvas', {
        // 创建一个 Canvas 画布
        width: 400,
        height: 280
      })
      .toBlob(function (blob) {
        // 将 Canvas 画布上的内容，转化为文件对象
        // 得到文件对象后，进行后续的操作
        // 5. 将文件对象，存储到 fd 中
        fd.append('cover_img', blob)
        // 6. 发起 ajax 数据请求
        editArticle(fd)
      })
  })

  // 定义一个编辑文章的方法
  function editArticle(fd) {
    $.ajax({
      method: 'POST',
      url: '/my/article/edit',
      data: fd,
      // 注意：如果向服务器提交的是 FormData 格式的数据，
      // 必须添加以下两个配置项
      contentType: false,
      processData: false,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('编辑文章失败！')
        }
        layer.msg('编辑文章成功！')
        // 发布文章成功后，跳转到文章列表页面
        location.href = '/article/art_list.html'
      }
    })
  }
})