---
date: 2014-04-27T00:00:00Z
published: true
status: publish
title: Starting to Build Things
type: post
url: /2014/04/27/starting-to-build-things/
---

I occasionally get emails from people with some amount of programming 
experience, usually purely academic, asking about how to get started with 
gaining practical experience. They want to start working on their own side 
projects, but they don’t really know where to begin.

I find it interesting that people often phrase their question as “what language 
should I learn?” or “what framework should I learn how to use?”.

The common ground between the responses I give is this: **what do you want to 
build?**

It’s far easier to stay motivated when you build things that you want yourself.  
This doesn’t have to be anything of any real utility - it can be a silly little 
thing that you just enjoying looking at or fiddling around with. For instance, 
as I explained in a [previous post][], some of my favorite creations have been 
completely useless.

Focus at first on making something that you want to use or play with. That way, 
when you have it, you’ll be motivated to keep improving it and toying around 
with it. I also think it’s important here to not worry about someone already 
having built it. You don’t need to make the best thing in the world or get 
everyone to use it. You don’t need to market it or convince anyone else of its 
merits. You just need to make something _you_ think is cool and learn some stuff 
along the way.

It’s okay to reinvent the wheel. You’ll learn a hell of a lot more making your 
own beautifully oblong wheel than riding atop 4 perfectly round ones someone 
made for you.

Keep in mind that what you do when you’re writing software for thousands of 
users, or trying to get to a minimum viable product as fast as possible is going 
to be different than what you do to keep yourself learning. And that’s okay.

Here’s a list of my projects that motivated me to learn how to program before I 
landed my first internship. I’m writing largely for my own nostalgic benefit, 
but I hope you can find some inspiration in it, or at least be reminded about 
your own learning adventures.

- For a math assignment, we had to enumerate some qualities of [pythagorean 
triples][]. We were supposed to do it by hand, but seeing it as an opportunity 
to try to code something, I built something in JavaScript that would just try 
all combinations under 100 and print them out. I initially learned JavaScript 
reading through one of those “Learn X in 24 hours” books.
- After learning how to install linux on an old tower desktop with the help of 
my friend [Eric][], I learned how to get a static IP address, a free domain 
name, and set up [Apache][]. After that, I could access static files served by 
the desktop in my basement while I was at school!
- Equipped with my own dinky server that I’d have to go home to reboot when it 
crashed, I wrote my own simple blog system in php. I wrote a little calendar 
widget for it, and it was black and bright green. Looking back, it was hideous, 
but I remember how cool I felt when I showed it to a few of my friends.
- Learning that I could do image manipulation in php using [GD][], I made an 
image to ASCII art converter where you could upload an image, and it would spit 
out a text area with the HTML that you could copy-and-paste to embed the ASCII 
version of the image on your own website. This was completely useless, and I 
doubt anyone but me and 2 of my friends ever used it, but I spent hours tweaking 
the parameters of it so it would come out just right.
- Realizing the error of my black-and-green ways, I rewrote my website (still in 
php) from scratch, and moved it onto a shared hosting service so it wouldn’t 
take 3 seconds to load my homepage. Writing MySQL queries everywhere was getting 
messy, so I wrote my own abstraction layer on top to give me an easier method of 
creating, updating, and deleting records. I was still completely unaware of any 
web frameworks, ORMs, or DAO libraries for php at the time, and I think I gained 
more experience because of it. My website now featured a photo gallery powered 
by [phpThumb][], and a commenting system complete with (unnecessary) CAPTCHAs 
that I wrote out using GD and stored in the session. My editor of choice was 
[phpDesigner][], and I tested things locally with [XAMPP][] before using 
[WinSCP][] to deploy to production.
- Armed with a bit of experience now, I talked to my computer science teacher 
about improving our school website [lisgar.ca][]. Instead of the calendar being 
updated in HTML manually and breaking the layout all the time, I modified it to 
read from a Google Calendar. This was entirely manual timestamp manipulation in 
php, and is probably among the worst code I’ve ever written, though I was 
oblivious to that at the time. From the looks of it, part of my code is still 
running there, almost 8 years later.
- Returning to [Virtual Ventures][] as a camp councillor, the summer camp that 
fostered my initial interest in programming, I saw that people were running into 
problems using our own custom camper sign-in system. Every time you signed in a 
camper, it would submit a form and reload the whole page, not restoring your 
scrolling position. Using newfangled technology, I used AJAX to make it update 
whenever you took an action instead of the whole page reloading every time. I 
used one of the first JavaScript libraries I had ever heard of, and the hot shit 
of the day: [Prototype][].
- A common pastime among the councillors when we had down time was to play 
[TextTwist][]. Thinking about how simple the mechanic of the game was, I made a 
Python program (I printed out the language documentation for Python because it 
looked interesting) that read in a list of dictionary words and took the letters 
in the game as input, then would spit out every word in the list that fit. I 
remember getting past tons of rounds until eventually it got stumped by 
“eclair”, which wasn’t in my word list. Thinking about how cool it would be if I 
could get my computer to type the words into the game for me, I learned about an 
automation language for Windows, [AutoIt v3][]. By the end of it, I would type 
my word into my Python program, which would print the results to a text file, 
then run my AutoIt program, which would type all the words into the game 
lightning fast! I came back to this a year or so later and taught it how to read 
the letters off the screen.
- Back in school, I got involved in playing some in-browser games. The most 
memorable to me was [Pokemon Crater][]. While at summer camp, I was exposed to 
network sniffing, and learned how to use [Wireshark][]. Armed with this, I 
started looking through how the HTTP requests were made in the game, then 
figured out how to duplicate them at 100x speed in a php script. I’d never heard 
of curl at this point, so I was manually constructing HTTP headers and sending 
them through a socket (and I didn’t understand what a socket was until much, 
much later). I had no concept of how to use threading or multiprocessing, so I 
just ran 6 copies of the program in different `cmd.exe` windows to speed it up.  
Within a week, I was at number one in the leaderboard of over a million users.  
Reading through the messages I got in my in-game inbox once I hit #1 was 
hilarious. Within two weeks, I had been banned. I posted on the forum explaining 
how I did it.
- I had friends on my high school year book council, and I learned that 
everyone’s yearbook quotes were handwritten on pieces of paper, then manually 
entered by the council volunteers. This seemed silly to me, so I made an online 
system to manage this, which was adopted immediately. It ran into a few hitches.  
One was that many people were writing their entries in Microsoft Word then 
pasting them into the browser form, resulting in unicode magic quotes. When it 
came out in the summary table, the characters were all garbled. My first 
encoding error! My code also broke when people used apostrophes because I forgot 
to escape them or use MySQL’s `?` substitution. My first SQL injection 
vulnerability!
- My friends got interested in another browser game — a tick-based strategy game 
called [Travian][]. Making a bot that ran faster than a regular user wasn’t 
helpful here, since I had only so many actions per hour. Instead, I decided I 
was going to make a lot of accounts and control them as a swarm. The site needed 
email confirmation, so I used different [mailinator][] addresses, then scraped 
mailinator to get the confirmation URL. Trying to make the names sound 
inconspicuous, I made a random username and password generator that would create 
usernames like JoeFootball92. After running my program for a couple hours, I had 
a few hundred accounts at my command. It turned out that writing an AI to make 
these these users do anything useful in concert was both tedious and difficult, 
so they ended up being free places to pillage for the people in the surrounding 
area.
- Getting into slightly more complex games, I started playing around with the 
fishing game that was part of [Gaia Online][]. It was a flash game where you had 
to pull a fishing rod to counteract the horizontal movement of the fish. At 
first I made something with AutoIt to track the movement of the fish based on a 
unique pixel color attached to the lure, then tried to move the mouse 
automatically. This worked occasionally, but it was pretty slow. From messing 
around with other flash games, I remembered I could decompile the SWF into 
source files and see what exactly was happening. Since the source wasn’t 
obfuscated, I could identify some key variables. I also figured out that if I 
embedded the SWF in a VB application, I could manipulate global variables 
directly! I modified the multiplier on the tug of the fish to be zero. Whenever 
I cast the rod, it would hook a fish, then the fish would slowly but surely come 
in a straight line to my bucket.
- At university, my projects slowed down a little as my workload increased, but 
I’d still find time to sneak them in from time to time. Based on a conversation 
I overheard between friends, I got the idea of making two connections to 
[Omegle][], then taking everything that one person said and sending it to the 
other, so that I could watch these anonymous conversations take place. I called 
it [Omegle Voyeur][]. It no longer works, but it was a fascinating project to 
watch when it first started exchanging words. My IP, and the IP of a friend 
hosting a mirror were both blocked as soon as it got posted to Reddit. I open 
sourced it, and soon after there was a CAPTCHA check.

The common element between all these projects was that they were all incredibly 
satisfying once I saw them work. I would get terribly stuck some times, but 
after enough googling for, honestly, usually the wrong thing, I was able to 
figure out what I needed to do to make it work.

I had the good fortune of being able to start working on these kind of things 
while still in high school, but if you didn’t, no need to distress. Many of the 
best programmers in the community started in their twenties or later. [DHH][], 
the creator of [Ruby on Rails][] started in his twenties, and so did [Yehuda 
Katz][], the creator of [Ember][] and [Handlebars.js][], and a core team member 
of Rails and [jQuery][] at various times.

I did a pretty wide variety of things to learn what I have about programming, 
but building things is the most common thing I hear questions about, so that’s 
where the focus is for this post. Among other activities were reverse 
engineering challenge sites, algorithmic competitions, and the occasional bit of 
academics.

If you still find yourself at a loss for ideas, click into one of the folders of 
[karan/Projects][]. If you’re still stuck for ideas or have an idea but don’t 
know where to get started, feel free to [shoot me an email][].

If you’re reading this as an experienced programmer, I want to hear about the 
cool projects you did to get started.

[previous post]: /2013/05/05/something-out-of-nothing/
[pythagorean triples]: http://en.wikipedia.org/wiki/Pythagorean_triple
[Apache]: http://httpd.apache.org/
[GD]: http://www.php.net/manual/en/book.image.php
[phpThumb]: http://phpthumb.sourceforge.net/
[lisgar.ca]: http://lisgar.ca/
[phpDesigner]: http://www.mpsoftware.dk/phpdesigner.php
[XAMPP]: https://www.apachefriends.org/index.html
[WinSCP]: http://winscp.net/eng/index.php
[Prototype]: http://prototypejs.org/
[TextTwist]: http://zone.msn.com/en/texttwist/default.htm?intgid=hp_word_1
[AutoIt v3]: http://www.autoitscript.com/site/
[karan/Projects]: https://github.com/karan/Projects
[jQuery]: http://jquery.com/
[Handlebars.js]: http://handlebarsjs.com/
[Yehuda Katz]: http://yehudakatz.com/
[Ember]: http://emberjs.com/
[Omegle Voyeur]: https://github.com/jlfwong/Omegle-Voyeur
[mailinator]: http://mailinator.com/
[Travian]: http://playgame.travian.us/landingpages?ad=10782_1111191000
[Wireshark]: http://www.wireshark.org/
[Pokemon Crater]: http://www.pokemonbattlearena.net/members/login.php
[Omegle]: http://www.omegle.com/
[Gaia Online]: https://www.gaiaonline.com/
[Eric]: http://www.evenchick.com/
[shoot me an email]: mailto:jamie.lf.wong@gmail.com?subject=Starting+to+Build+Things
[Ruby on Rails]: http://rubyonrails.org/
[Virtual Ventures]: http://virtualventures.ca/
[DHH]: http://david.heinemeierhansson.com/
