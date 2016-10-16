---
date: 2011-10-16T00:00:00Z
published: true
status: publish
tags:
- Fifteen Puzzle
- algorithms
- Intro to AI
- coffeescript
- Las Vegas
- Monte Carlo
title: The Fifteen Puzzle - The Algorithm
type: post
url: /2011/10/16/fifteen-puzzle-algorithm/
---

<link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Satisfy"
type="text/css">
<link rel="stylesheet"
href="http://jamie-wong.com/experiments/fifteen-puzzle/style/puzzle.css"
type="text/css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js"></script>
<script src="http://jamie-wong.com/experiments/fifteen-puzzle/vendor/underscore-min.js"></script>
<script src="http://jamie-wong.com/experiments/fifteen-puzzle/src/shared.js"></script>
<script src="http://jamie-wong.com/experiments/fifteen-puzzle/src/grid.js"></script>
<script src="http://jamie-wong.com/experiments/fifteen-puzzle/src/solver.js"></script>
<script src="http://jamie-wong.com/experiments/fifteen-puzzle/src/puzzle.js"></script>

<div id="puzzle" style="margin: 0 auto 20px auto"></div>
<script>var puzzle = new Puzzle($('#puzzle'))</script>

Before you read this, play with the above puzzle. You can move the blocks around 
yourself by clicking on one adjacent to the empty square. Click "shuffle" and 
the blocks will rearrange themselves using 25 randomly selected moves. Click 
"solve" from any configuration that isn't already ordered 1-15 and you'll see 
the blocks rearrange themselves.

If you hit shuffle more than 2 times, it'll take some work to solve the puzzle, 
so you'll see it solving for a while before it actually does anything. The 
version you see above is actually throttled so it doesn't freeze your browser or 
use hundreds of MB of memory.

As always, you can see source for the above:
[github.com/jlfwong/fifteen-puzzle][].

Background
==========

I've been going through Stanford's free online [Introduction to Artificial 
Intelligence][ai-class] with my housemates and have been enjoying them. My 
favourite thing from the first set of lectures was the example of heuristics 
being applied to the [Fifteen Puzzle][]. So I wrote up a solver and made the 
interactive demo you see above. Start watching at [Unit 2, Topic 31, Sliding 
Blocks Puzzle][sliding-puzzle-intro] to see a great explanation of what I'm 
doing.

Algorithm
=========

The algorithm I used is pretty much exactly what's described in the video. My 
solution in coffeescript is an optimized and throttled version of the following:

```coffeescript
solve = (startGrid) ->
  frontier = new PriorityQueue
  frontier.enqueue(new SolverState(startGrid, []))

  while not frontier.empty()
    curState = frontier.dequeue()

    if curState.solved
      return curState.steps

    candidateMoves = grid.validMoves()

    for move in candidateMoves
      nextGrid = grid.applyMove(move)
      nextSteps = curState.steps.concat([move])
      nextState = new SolverState(nextGrid, nextSteps)
      frontier.enqueue(nextState)
```

`SolverState` stores the current position of all the numbers in the grid and the 
list of steps to get there from the starting grid.

`PriorityQueue` is responsible for making sure we always explore the lowest cost 
state first. The cost of the state is the number of steps taken from the initial 
state plus the estimated number of steps remaining to get to the solution. This 
estimate (h2 from [Unit 2, Topic 31][sliding-puzzle-intro]) is admissible 
because each move can at best reduce that estimate by one.

`grid.validMoves` returns a list of all valid moves to make the on the grid. If 
the empty square is in the middle of the grid, this is all four directions. If 
it's in a corner, there are only two valid directions.

Optimizations
=============

The algorithm described above will yield the optimal solution (fewest number of 
moves) for any valid fifteen-puzzle configuration. But it's pretty slow and can 
be much improved.

Tree Pruning
------------
When looking at the search tree, there are some branches we can guarantee will 
not yield an optimal solution. The most obvious one here is to never go 
backwards. In the above algorithm, we can prevent going backwards like so:

```coffeescript
lastStep = _.last(steps)
if lastStep?
  candidates = _(candidates).filter (x) ->
    not directionsAreOpposites x, lastStep
```

I'm using [underscore.js][] for its functional goodness, so that's where 
`_.last` and `_.filter` come from.

Las Vegas Randomization
-----------------------
While the algorithm always takes the lowest cost state, there will frequently be 
ties. Because of of the nature of how `validMoves` works, this means that the
algorithm will make a disproportionate number of moves in the same direction.  
To fix this, we shuffle the list of valid moves before we start adding states to 
the priority queue. To do this, we change the `candidates = ...` line to be:

```coffeescript
candidates = _.shuffle(grid.validMoves())
```

A [Las Vegas algorithm][] is always right and sometimes fast. This is in 
contrast to a [Monte Carlo algorithm][], which is always fast and sometimes 
right.

Min-Heap Priority Queue
-----------------------
Once I applied the above to make the algorithm terminate in fewer iterations, it 
was time to optimize each iteration. By using Chrome Developer Tools, I was able 
to identify that the JavaScript runtime was spending most of its time in 
`ProrityQueue::enqueue`.

The first version I made of this used an `O(nlogn)` enqueue, `O(1)` dequeue 
method: I just appended and sorted after every enqueue and popped the element 
off the back of the array on dequeue.

Once I saw it was a bottleneck, I reimplemented the `PriorityQueue` as a 
[min-heap][] to get `O(logn)` enqueues and dequeues, and this improved 
performance significantly.

You can see my implementation of a heap in coffeescript in [solver.coffee][].

Leveraging Known Results
------------------------
After I switched to a min-heap, the next bottleneck was calculating the 
heuristic estimate. The observation here that made this faster is that the 
heuristic value can be determined for a state based on the previous state and 
the move used to get there. This prevents the need to recalculate the estimate 
for all the grids generated.

You can see this update applied on the commit: [Leverage known results for 
lowerSolutionBound][lowerSolutionBound].

That's all for the algorithm. I'm planning to do two more posts about this project 
- one on using Chrome Developer Tools to optimize and how to not crash the 
browser, and another on the Jasmine test framework and literate programming with 
coffeescript. If you want to know when those come out, you should follow me on 
twitter [@jlfwong][twitter].

[Fifteen Puzzle]: http://en.wikipedia.org/wiki/Fifteen_puzzle
[ai-class]: https://www.ai-class.com/
[sliding-puzzle-intro]: https://www.ai-class.com/course/video/quizquestion/15/1
[underscore.js]: http://documentcloud.github.com/underscore/
[Las Vegas algorithm]: http://en.wikipedia.org/wiki/Las_vegas_algorithm
[Monte Carlo algorithm]: http://en.wikipedia.org/wiki/Monte_Carlo_algorithm
[github.com/jlfwong/fifteen-puzzle]: https://github.com/jlfwong/fifteen-puzzle
[min-heap]: http://en.wikipedia.org/wiki/Binary_heap
[solver.coffee]: https://github.com/jlfwong/fifteen-puzzle/blob/5ec9ffad6eab8309027e9fe19013b02c4b4f872a/src/solver.coffee
[lowerSolutionBound]: https://github.com/jlfwong/fifteen-puzzle/commit/c6057dc1956cfbe89a119aa26ba0a65f50bc3824
[twitter]: http://twitter.com/jlfwong
