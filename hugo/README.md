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

    make install

From there, you should be able to boot the server on port 1313 by running:

    make

TODO maybe later:
[ ] Delete Jekyll?
[ ] katex pre-rendering?
[ ] Email subscription?
[ ] Get rid of date from file names
[ ] Get rid of date from URLs (would require redirects)
[ ] Move experiment code in here (stop needing a new repo for everything)
