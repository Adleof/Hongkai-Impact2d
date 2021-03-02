# Hongkai-Impact2d

Hi, this is Fulan Li, the author of the game Honkai Impact 2d.

Most of elements in this game are from mobile game Honkai Impact 3. Some audio and visual effect are from Sekiro. They are both my favorate games.
I may add some new features and characters in the future.

If you have any suggestions, feel free to discuss them in the Discussions section on Github.
I hope you like this game.

# 游戏名：崩坏2D
作者：Fulan Li(Adleo)，Ruichang Chen
### 游玩方式
打包下载全部文件后点开 “Template.html” 或点开链接
### 操作指南
- 键盘A和D左右移动
- J键攻击
- K键闪避
-  - 极限闪避会触发3秒的全局时空断裂，CD15秒
- I键进入防御姿态
- - 当SP量大于等于15时，按下I键将消耗15SP并进入防御姿态，防御姿态下被攻击会免除本次伤害并发动反击造成大量伤害
- - 若进入防御姿态的瞬间被攻击，则会发动强化防御反击，造成双倍伤害并产生时空断裂，同时会返还10SP并大幅减少大招cd (变成星星吧！)
- 底部黄条和数字为SP槽与SP量，攻击与闪避/极限闪避成功均会获得一定量的SP
- 底部左边的圆圈为极限闪避CD（触发极限闪避后会出现），右边为大招CD（若SP不足则会显示为灰色）
### 游戏演示与制作花絮
https://www.youtube.com/watch?v=JsuCJTn3b3o
### 游戏简介
大家好，这里是崩坏2D的作者Adleo。此游戏为本人在Virginia Tech大学ECE 4525 Video Game Design and Engineering课程的Final project。我负责所有游戏系统的开发与构建，Ruichang负责部分动作的调整。

本游戏的灵感来源于B站up主 @反坦克小黄鸡 的视频【崩坏3/只狼】嘤 逝 二 度（BV1cJ411b74A）。在此非常感谢@反坦克小黄鸡提供的人物/Boss与背景的美术素材。

制作游戏使用的语言为JavaScript。这个游戏的特别之处在于它只用了最基本的processingJS环境包。因此游戏的底层比如关键帧系统，角色骨骼系统，碰撞/攻击判定，画面特效，镜头等全部都由自己的代码来实现。如果KhanAcademy支持上传本地文件的话你甚至能把代码原封不动地复制上去跑（ECE 4525这节课的主要内容就是在KhanAcademy上写各种小游戏来介绍游戏设计）。

整个项目从proposal到最后完成花了大概一个月的时间。其实我最开始也没想到能做出这样的效果，毕竟课上的作业大都是一些简单的小游戏。最开始的代码是自己写的一段关键帧系统，然后在这个基础上模仿3d软件设计了一个骨骼系统来控制纸片小人。最开始的调试非常繁琐，角色的动作数据就是一串数字array，想要看调整之后的效果只能点保存然后刷新页面。但是在最后看到角色不仅能动起来甚至还能慢动作播放的时候感觉一切都值了。再到后面越写越上头，逐帧分析游戏录像，不仅做出了闪避成功的短暂时停，时空断裂系统还研究出了一些简单的特效（光污染）。最后due前的一周更是大胆发挥加入了boss的二阶段，镜头跟随，镜头抖动，雨水特效，背景音乐，音效等等各种我能想到的动作游戏的细节。可以说写到最后已经不是为了分数，而是因为我自己喜欢在写这个游戏。

崩坏3和只狼是我非常喜欢的两款游戏。崩坏3我从开服一直玩到现在，只狼游戏流程很短当时刚发售玩了20个小时就通了，但是我不知不觉也已经玩了133个小时，什么敲钟护符高周目之类的能玩的也早都已经玩烂了。能做出这两个游戏的同人小游戏我感觉非常开心。也希望你们能喜欢这个游戏。
### 素材来源
- 主角/boss人设：@反坦克小黄鸡
- 背景画面：@反坦克小黄鸡
- 游戏内音效：
- - 脚步声，时空断裂，闪避，角色/boss攻击音效等：崩坏3游戏内录制
- - 完美弹反音效，危字音效，忍杀音效等：Youtube视频
- 画面特效：使用sai软件自制
