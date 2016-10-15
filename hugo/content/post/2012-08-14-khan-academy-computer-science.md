---
date: 2012-08-14T00:00:00Z
tags:
- mercurial
- arcanist
- khan-academy
title: 'Khan Academy Computer Science: Instant Gratification and Bragging Rights'
url: /2012/08/14/khan-academy-computer-science/
---

![Maze](/images/12-08-14-maze.png)

When I was 6 years old, my mom asked me what kind of summer camp I wanted to go 
to. I excitedly exclaimed "LEGO!" She laughed it off a little then asked me to 
choose some other options, so I picked a couple sports camps and trampoline 
camp.

A few weeks later, she found a Science and Technology camp called [Virtual 
Ventures][1] which actually did have playing with LEGO as part of the camp 
activities. But it was even better than that -- it was LEGO robotics!

I went to that camp for the first time in 1998. In the 11 years that followed, I 
spent almost every full summer there, first as a camper, then as a volunteer, 
then 3 summers as an instructor. (I played with LEGO almost every week of it.)
The life changing thing I got out of it was a fascination with programming.

When I started there, I was saving HTML files to 3.5" floppies showing off my 
talent with `<marquee>`, `<center>` and (probably) `<blink>` tags. By the time I 
left before going to the University of Waterloo, I had rewritten the camp 
registration system, taught kids about how the internet works, [ARP spoofing][2] 
and botnets, written my own (terrible) blog system from scratch, had a stint as 
a [teenage hacker][3], began my adventure into vim, and generally did my 
damnedest to get kids interested in programming.

Through all of that, where I spent my computing time varied wildly, but the one 
element that was almost always present was web development. Two reasons I think 
that this persevered over all else:

1. **Instant gratification**. When I added an image to a page or changed the 
   font color of my blaring neon header, I didn't need to wait for a recompile 
   to see the changes -- I just refreshed the page.
2. **Bragging rights**. When I made something cool on the web, I didn't have to 
   tell my friends to all go download it, unzip it, run the installer and make 
   sure they have the right DLLs -- I just said "Look at this cool thing I made! 
   Click this link!".

And these are two aspects that we tried to amplify like crazy when building 
[Khan Academy Computer Science][4].

Khan Academy Computer Science
=============================

I was at [CUSEC][5] when Bret Victor did his incredible talk [Inventing on 
Principle][6], so I was ecstatic when I found out I would be working with [John 
Resig][7] on making one of the editors in the video a reality. If you haven't 
watched Bret Victor's presentation yet, do it _right now_.

This is something that really can't adequately be expressed with words, so I'll 
let the soothing voices of [Salman Khan][8] and John Resig do it for me in this 
introductory video:

<iframe width="560" height="315" src="http://www.youtube.com/embed/tygZ2A8rytQ" 
frameborder="0" allowfullscreen></iframe>

There's a whole bunch of stuff to be excited about with the introduction of 
Computer Science, but I'll just focus on how we facilitated the two aspects I 
mentioned before.

For more depth, John Resig wrote an eloquent post explaining the motivation for 
the new platform: [Redefining the Introduction to Computer Science][12].
There's also an official announcement on the Khan Academy blog: [Khan Academy 
Computer Science][13].

Instant Gratification
=====================

Here, instant gratification is all about seeing the effects of what you've done 
as quickly as possible.

Instant Update
--------------
Every time you make any change to the code in the editor, the changes will come 
into effect immediately.

This means no edit-compile-run loop workflow that you see for compiled 
languages.  There isn't even an edit-run/edit-refresh workflow you get using 
scripting languages. There's just edit-look-to-the-right.

Number Scrubber, Color Picker, Image Picker
-------------------------------------------

![Pickers](/images/12-08-14-pickers.png)

Since we have instant update, we can improve the experience further by reducing 
the friction on tweaking parameters. We made custom controls that let you tweak 
numbers, colors and images in the editor without having to type a thing.

The cool thing about the pickers is that they're not only useful for tweaking 
parameters you know and understand -- they're useful for figuring out what a 
parameter _does_. If you're experimenting with someone else's code, you can play 
around with the number and see what effect changing them has in real time.

This is really something that'll just be easier for you to try than for me to 
explain.  I suggest playing around with the number scrubber and color picker on 
[Tree Generator][8] and playing around with the image picker on [Birds Flock 
Together][9].

Bragging Rights
===============

I think most people who start learning how to code outside of academics do it to 
make cool stuff to show off to their friends. We wanted to make that process 
even easier by making it dead simple to get some code up and running on a 
webpage viewable by the world.

Saving and Forking
------------------

There are two ways to get a Program with your name on it for the world to see.  
The first is saving a brand new program you made from scratch on the [New 
Program][10] page.

The second is "forking" an existing program. In the user interface, the button 
is labelled "Save As...". If you play around with someone else's program and you 
want to save your modified version -- no need to copy and paste the code for 
into a blank program -- you can just "Save As..." and then you have your own 
saved copy.

Regardless of which you do, after you save, you'll be brought to a page with a 
permalink for your new program, which you can share with the world! You can show 
off your work to your friends and family immediately.

Social Integration
------------------

![Share](/images/12-08-14-share.png)

In the world of SoLoMo, listing "Social Integration" as a feature has started to 
feel a bit jokey, but this time it's not about "viral growth" or "lowering user 
acquisition cost", it's about giving our users a channel to brag about the 
awesome things they've made. It's about getting people to be proud of what 
they've made and trotting it through their social network saying "Look at this 
ball! I made it bounce!"

To meet that end, we made it really easy to share Programs through facebook, 
twitter and email.

I won't muddle up this post with descriptions of what I did during my internship 
-- that'll come in another post. For now, I'll just say that working on Computer 
Science has been a blast. If you're interested in joining an amazing team 
working on creating free, world-class education for the world, check out 
[Careers at Khan Academy][11] for job openings.


[1]: http://www.virtualventures.ca/new/
[2]: http://en.wikipedia.org/wiki/ARP_spoofing
[3]: http://www.codinghorror.com/blog/2012/08/i-was-a-teenage-hacker.html
[4]: http://khanacademy.org/cs
[5]: http://cusec.net/
[6]: https://vimeo.com/36579366
[7]: http://ejohn.org/
[8]: http://www.khanacademy.org/cs/tree-generator/822944839
[9]: http://www.khanacademy.org/cs/birds-flock-together/940061217
[10]: http://khanacademy.org/cs/new
[11]: http://www.khanacademy.org/careers
[12]: http://ejohn.org/blog/introducing-khan-cs/
[13]: http://www.khanacademy.org/about/blog/post/29417655743/computer-science
