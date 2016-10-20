This blog is written against Hugo: https://gohugo.io

I use a fork of hugo, so to use that you'll need to set up go:

    brew install go

set your $GOPATH to something sensible

    export GOPATH="$HOME/golang"
    export PATH="$GOPATH/bin:$PATH"

Then run

    go get github.com/jlfwong/hugo

From there, you should be able to run

    hugo server

TODO:
[ ] Theme
[ ] RSS feed
[ ] Unlist posts
[ ] Disqus, disabled by default
[ ] GitHub, Twitter links
[ ] Previous and next links

Components
[ ] Image w/ Caption
[ ] YouTube embeds
[ ] Shadertoy embeds
[ ] Codepen embeds
[ ] Custom embeds (i.e. the ones from the fluid sim post)
[ ] Blockquotes
[ ] Select better colorscheme for pygments
