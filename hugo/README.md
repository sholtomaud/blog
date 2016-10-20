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
[ ] RSS feed (atom.xml)
[ ] Bio somewhere?
[ ] Delete Jekyll?
[ ] Email subscription?
[ ] robots.txt
[ ] Sitemap?
[ ] katex pre-rendering?
