This blog is written against Hugo: https://gohugo.io. It was originally written 
in Jekyll, but I'm moving off it because I was tired of dealing with broken Ruby 
dependencies all the time (looking at you, nokogiri). Hopefully go's situation 
is less crazy (though maybe only if you fork the work).

I use a fork of hugo, so to use that you'll need to set up go:

    brew install go

set your $GOPATH to something sensible

    export GOPATH="$HOME/golang"
    export PATH="$GOPATH/bin:$PATH"

Then run

    go get github.com/jlfwong/hugo

From there, you should be able to run

    hugo server

You'll also need pygments for the syntax highlighting, otherwise I'll 
accidentally upload a version of my site with no syntax highlighting (for like 
the 3rd time)

    sudo pip install Pygments

TODO:
[ ] Bio somewhere?
[ ] Delete Jekyll?
[ ] Twitter/GitHub links

TODO maybe later:
[ ] katex pre-rendering?
[ ] Email subscription?
[ ] Get rid of date from file names
[ ] Get rid of date from URLs (would require redirects)
[ ] Move experiment code in here (stop needing a new repo for everything)
