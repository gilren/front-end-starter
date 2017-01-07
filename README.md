# Front end boilerplate

### Installation

You need Gulp installed globally:
<pre>
$ npm install --global gulp-cli
</pre>

#### - Main process
<pre>
$ git clone https://github.com/gilren/front-end-starter.git project name
$ cd project name
$ npm install
$ bower update
$ gulp
</pre>

#### - Make a prod version
<pre>
$ gulp prod
</pre>

##### - (Optional) Remove git history
<pre>
$ cd project name
$ rm -rf .git
$ git init
$ git add .
$ git commit -m "Initial commit"
</pre>

##### - Available tasks
<pre>
$ gulp
$ gulp prod
$ gulp min
$ gulp min-js
$ gulp clean
$ gulp copy
</pre>

##### - Bootstrap override

Use the file located in src/vendor/partials/_variable_bootstrap.scss to override the bootstrap variables

### TODOS
- [x] Min css
- [x] Min js
- [ ] Min images
- [ ] Svgsprite
- [ ] Bootstrap grid changes explanation
