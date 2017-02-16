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
$ gulp prod --min true  
$ gulp min-css
$ gulp min-js
$ gulp clean
$ gulp copy
</pre>

### TODOS
- [x] Min css
- [x] Min js
- [x] Min images
- [ ] Svgsprite

##### - Bootstrap override  
Use the file located in src/vendor/partials/_variable_bootstrap.scss to override the bootstrap variables
