# grunt-pulses

> compile build dist tool

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-pulses --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-pulses');
```

## The "pulses" task

### Overview
In your project's Gruntfile, add a section named `pulses` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  pulses: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.logFile
Type: `String`

#### options.listFile
Type: `String`

#### options.pListFile
Type: `String`

#### options.dist
Type: `String`
the directory for dist

#### options.banner
Type: `String`
Default: ''

#### options.confirm
Type: `Boolean`
Default: true
whether to cofirm before upload

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
    pulses: {
      options: {
        banner: '/* <%= pkg.name %> <%= grunt.template.today( "yyyy-mm-dd HH:MM:ss" ) %> */\n',

        //编译目录
        dist: 'dist',
        logFile: 'dist/log.txt',

        //压缩服务生成的上传清单
        pListFile: 'dist/plist.txt',

        //不做版本号替换的文件
        excludes: [ /(^|\/)kao\./, /(^|\/)dict\./, /(^|\/)inc\./, /(^|\/)gg\.seed\./, /(^|\/)hdpv\./ ],

        // 字典文件正则, 用于上线时先上线普通文件，最后上线字典文件
        mapFiles : [ /(^|\/)kao\./, /(^|\/)dict\./, /(^|\/)inc\./, /(^|\/)gg\.seed\./, /(^|\/)swfobject\./ ],
      },

      min: {
        options: {
          listFile: 'dist/list.txt',
        },
        files: {
          //字典文件
          src: ['js/kao.js', 'js/dict.js', 'js/gg.seed.js', 'js/base/plugin/swfobject.js', 'js/**/inc.js', '!js/test/**/*.js']
        }
      },

      ftp_test: {
        options: {
          //上线前是否需要确认, 默认是true
          confirm: true,
          ftp: 'dist/ftp_test.json'
        }
      },

      ftp_dist: {
        confirm: true,
        ftp: 'dist/ftp_dist.json'
      }
    },
})
```
target name start with 'min' means to minify files and generate file name useing 'sha1'    
target name start with 'ftp' means to upload files use ftp

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2015 creep. Licensed under the MIT license.
