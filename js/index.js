function Game(tr, td, mineNum) {
  //初始化
  this.td = td;
  this.tr = tr;
  this.mineNum = mineNum; //存储预设或设定的炸弹总数，用于后续判断是否胜利使用
  this.surplusMine = 0; //剩余雷数
  this.mineInfo = []; //用于接收随机生成的雷的信息
  this.tdsArr = []; //存放单元格的信息
  this.isPlay = false; //是否开始玩
  //打开的数字样式名称
  this.openClass = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  //生成游戏区域和剩余炸弹数显示框
  this.gameBox = document.getElementById("gameBox");
  this.table = document.createElement("table"); //生成table标签
  this.footerNum = document.getElementById("surplusMine"); //剩余炸弹数量显示框
}

Game.prototype.creatDom = function () {
  //创建游戏区域，在玩家第一次点击游戏区域的时候执行
  this.table.oncontextmenu = function () {
    return false;
  }; //清除默认右键单机事件
  for (let i = 0; i < this.gameBox.children.length; i++) {
    //为防止重新开始游戏时，重复生成多个table，在添加之前先删除之前的
    let childNod = this.gameBox.children[i];
    this.gameBox.removeChild(childNod);
  }

  for (let i = 0; i < this.tr; i++) {
    let tr = document.createElement("tr");
    this.tdsArr[i] = []; //为每一行生成一个数组

    for (let j = 0; j < this.td; j++) {
      let td = document.createElement("td");
      tr.appendChild(td); //将生成的td插入到tr中
      this.tdsArr[i][j] = td;
      td.info = {
        //info属性包括了单元格的所有信息，很重要
        type: "number", //格子类型，用于判断是否时炸弹
        x: i, //行
        y: j, //列
        value: 0, //当该格子周围有炸弹时显示该数值，生成炸弹的时候会++
        isOpen: false, //判断该单元格是否被打开
        isFlag: false, //判断是否有标记flag
      };
    }
    this.table.appendChild(tr); //见tr插入到table中
  }
  this.gameBox.appendChild(this.table);
};

Game.prototype.creatMine = function (event, target) {
  //生成炸弹，该方法会在用户第一次点击棋盘的时候执行一次

  let This = this;
  for (let i = 0; true; i++) {
    //随机生成炸弹，生成扎当数与设定扎当书mineNum相同时终止循环
    let randomX = Math.floor(Math.random() * this.tr), //随机生成炸弹的行数
      randomY = Math.floor(Math.random() * this.td); //随机生成炸弹的列数
    //   console.log(randomX + " " + randomY)
    if (target.info.x != randomX || target.info.y != randomY) {
      //保证第一次点击的时候不是炸弹，暂不生效
      if (this.tdsArr[randomX][randomY].info.type != "mine") {
        //保证每次生成的雷的位置不重复

        this.tdsArr[randomX][randomY].info.type = "mine"; //单元格更改属性为雷
        this.surplusMine++; //生成雷的数量+1
        this.mineInfo.push(this.tdsArr[randomX][randomY]); //将生成的雷的信息存放到this变量中，方便后续使用
      }
      if (this.surplusMine >= this.mineNum) {
        //当生成的炸弹数量等于设定的数量后跳出循环
        break;
      }
    }
  }

  //为每个炸弹周围的方格添加数字
  for (let i = 0; i < this.mineInfo.length; i++) {
    let around = this.getAround(this.mineInfo[i], This); //获取每个炸弹的周围方格
    //   console.log(this.getAround(this.mineInfo[i], This))

    for (let j = 0; j < around.length; j++) {
      //将周围每个方格的value++
      around[j].info.value += 1;
    }
  }

  // 开始计时
  start();
};

Game.prototype.getAround = function (thisCell, This) {
  //获取某个方格的周围非炸弹方格，需要传递一个单元格dom元素，Game的this
  let x = thisCell.info.x, //行
    y = thisCell.info.y, //列
    result = [];
  //   x-1,y-1       x-1,y       x-1,y+1
  //   x,y-1         x,y         x,y+1
  //   x+1,y-1       x+1y        x+1,y+1
  for (let j = x - 1; j <= x + 1; j++) {
    for (let k = y - 1; k <= y + 1; k++) {
      if (
        //游戏区域的边界，行数x和列数y不能为负数，且不能超过设定的行数和列数
        j < 0 ||
        k < 0 ||
        j > This.tr - 1 ||
        k > This.td - 1 ||
        //同时跳过自身和周边是雷的方格
        This.tdsArr[j][k].info.type == "mine" ||
        (j == x && k == y)
      ) {
        continue; //满足上述条件是则跳过当此循环；
      } else {
        result.push(This.tdsArr[j][k]); //将符合的单元格push到result中返回
      }
    }
  }
  return result;
};

Game.prototype.lifeMouse = function (event, target) {
  //左键点击事件
  let This = this; //用变量的方式将Game的this传递到函数中
  let noOpen = 0; //没有被打开的格子数量
  if (!target.info.isFlag) {
    //表示该必须没有被右键标记才能鼠标左击
    if (target.info.type == "number") {
      //是数字时,则可视化
      function getAllZero(target, This) {
        //递归函数
        //   console.log(target.info)
        if (target.info.isFlag) {
          //当这个单元格之前有被标记过flag时，则将剩余炸弹数+1
          This.surplusMine += 1;
          target.info.isFlag = false; //单元格被打开后初始化flag
        }
        if (target.info.value == 0) {
          //等于格子的value等于0的时候

          target.className = This.openClass[target.info.value]; //可视化

          target.info.isOpen = true; //表示该单元格被打开

          let thisAround = This.getAround(target, This); //获取该单元格周围的格子信息

          for (let i = 0; i < thisAround.length; i++) {
            //   console.log(thisAround[i].info.isOpen)
            if (!thisAround[i].info.isOpen) {
              //递归的条件，当格子的open为true时不执行

              getAllZero(thisAround[i], This); //执行递归
            }
          }
        } else {
          target.innerHTML = target.info.value;
          target.className = This.openClass[target.info.value]; //可视化
          target.info.isOpen = true; //表示单元格被打开
          target.info.isFlag = false; //单元格被打开后初始化flag
        }
      }

      getAllZero(target, This); //首次执行

      //每次鼠标左键点击的时候都需要检查一下没有被打开的方格数量，每有一个则noOpen++
      for (let i = 0; i < this.tr; i++) {
        for (let j = 0; j < this.tr; j++) {
          if (this.tdsArr[i][j].info.isOpen == false) {
            noOpen++;
          }
        }
      }
      //当noOpen的数量与炸弹数量相同时，说明剩余的方格全是雷，游戏通过
      if (noOpen == this.mineNum) {
        console.log(noOpen);
        this.gameWin();
      }
    } else {
      //点击到了炸弹，游戏结束
      this.gameOver(target);
    }
  }
};

Game.prototype.rightMouse = function (target) {
  //鼠标右键点击执行
  if (!target.info.isOpen) {
    if (!target.info.isFlag) {
      //标记
      target.className = "targetFlag"; //显示旗帜
      target.info.isFlag = true; //表示该方格已经被标记
      this.surplusMine -= 1; //每标记一个方格，剩余炸弹数量-=1
      //   console.log(this.surplusMine)
    } else {
      //取消标记
      target.className = ""; //去掉旗帜
      target.info.isFlag = false;
      this.surplusMine += 1;
      //   console.log(this.surplusMine)
    }

    let isWin = true;
    if (this.surplusMine == 0) {
      //标记完所有flag时，遍历所有单元格
      //   console.log(this.mineInfo.length)
      for (let i = 0; i < this.mineInfo.length; i++) {
        console.log(this.mineInfo[i].info.isFlag);
        if (!this.mineInfo[i].info.isFlag) {
          //检查每个雷的isFlag属性是否被标记，只要有一个为false则输掉游戏
          isWin = false;
          this.gameOver(target, 1);
          break;
        }
      }
      isWin ? this.gameWin(1) : 0; //三目运算符号
    }

    //   if (this.surplusMine == 0) { //标记完所有flag时，遍历所有单元格
    //       for (let i; i < this.tr; i++) {
    //           for (let j; j < this.td; j++) {
    //             if()
    //           }

    //       }
    //   }
  }
};

Game.prototype.gameOver = function (target, code) {
  //游戏结束，code为触发代码，当旗用完了时为1，点击到炸弹为0
  //   console.log(this.mineInfo)
  let mineInfoLen = this.mineInfo.length;
  for (let i = 0; i < mineInfoLen; i++) {
    //显示每个雷的位置
    this.mineInfo[i].className = "mine";
  }
  this.table.onmousedown = false; //取消鼠标事件

  if (code) {
    window.location.replace("end/1.html"); //结局：用尽旗子
    Reset();
  } else {
    target.className = "targetMine"; //触发雷标红色
    window.location.replace("end/2.html"); //结局：触发地雷
    Reset();
  }
};

Game.prototype.gameWin = function (code) {
  //游戏胜利
  if (code) {
    tellTime();
    window.location.replace("end/3.html"); //结局：全部标记
  } else {
    tellTime();
    window.location.replace("end/4.html"); //结局：全部翻开（安全
  }
  this.table.onmousedown = false;
};

Game.prototype.play = function () {
  let This = this; //需要将this传递到事件函数中使用
  this.table.onmousedown = function (event) {
    event = event || window.event; //兼容IE
    target = event.target || event.srcElement; //兼容IE

    if (!this.isPlay) {
      //首次点击初始化棋盘，随机生成炸弹
      this.isPlay = true;
      This.creatMine(event, target);
    }

    if (event.button == 0) {
      //鼠标左键点击时执行
      This.lifeMouse(event, target);
    } else if (event.button == 2) {
      //右键点击执行
      This.rightMouse(target);
    }
    This.footerNum.innerHTML = This.surplusMine; //每次点击右键，刷新页面下方的剩余雷数
  };
};

Game.prototype.tablePos = function () {
  //将table居中显示
  let width = this.table.offsetWidth,
    height = this.table.offsetHeight;
  //   console.log(this.table.offsetWidth)
  this.table.style.width = width + "px  ";
  this.table.style.height = height + "px  ";
};

function addEvent(elem, type, handle) {
  //添加事件函数
  if (elem.addEventListener) {
    //w3c标准
    elem.addEventListener(type, handle, false);
  } else if (elem.attachEvent) {
    //IE9及以下
    elem.attachEvent("on" + type, function () {
      handle.call(elem);
    });
  } else {
    //其他情况
    elem["on" + type] = handle;
  }
}

Game.prototype.setDegree = function () {
  //调整难度
  let button = document.getElementsByTagName("button");

  addEvent(button[0], "click", function () {
    //简单
    let game = new Game(10, 10, 10);
    game.creatDom();
    game.play();
    game.tablePos();
    Reset();
  });

  addEvent(button[1], "click", function () {
    //一般
    let game = new Game(16, 16, 50);
    game.creatDom();
    game.play();
    game.tablePos();
    Reset();
  });

  addEvent(button[2], "click", function () {
    //困难
    let game = new Game(30, 30, 125);
    game.creatDom();
    game.play();
    game.tablePos();
    Reset();
  });

  addEvent(button[3], "click", function () {
    //自定义
    let Width = Math.trunc(prompt("雷区的宽（格数）？"));
    let Height = Math.trunc(prompt("雷区的高（格数）？"));
    let mainNumber = Math.trunc(prompt("雷区的全部雷数？"));
    let Ge = Width * Height;
    if (parseInt(mainNumber <= 0)) {
      alert("雷的总数不得小于或等于零，请重新输入。");
    } else if (parseInt(Ge) <= parseInt(mainNumber)) {
      alert("雷区的总格数不得小于雷的总数，请重新输入。");
    } else if (parseInt(Ge) <= 2) {
      alert("雷区不得小于两格，请重新输入。");
    } else if (parseInt(Ge) >= 10000) {
      alert("保护电脑，人人有责。");
    } else {
      let game = new Game(Width, Height, mainNumber);
      game.creatDom();
      game.play();
      game.tablePos();
      Reset();
    }
  });
};

//   默认棋盘
let game = new Game(10, 10, 98);
game.creatDom();
game.play();
game.tablePos();
game.setDegree();

// 以下为计时器部分

//初始化变量
let hour, minute, second; //时 分 秒
hour = minute = second = 0; //初始化
let millisecond = 0; //毫秒
let int;
//开始函数
function start() {
  int = setInterval(timer, 50); //每隔50毫秒执行一次timer函数
}
//计时函数
function timer() {
  millisecond = millisecond + 50;
  if (millisecond >= 1000) {
    millisecond = 0;
    second = second + 1;
  }
  if (second >= 60) {
    second = 0;
    minute = minute + 1;
  }

  if (minute >= 60) {
    minute = 0;
    hour = hour + 1;
  }
  document.getElementById("timetext").value =
    hour + "时" + minute + "分" + second + "秒" + millisecond + "毫秒";
}
//暂停函数
function stop() {
  window.clearInterval(int);
}
//重置函数
function Reset() {
  window.clearInterval(int);
  millisecond = hour = minute = second = 0;
  document.getElementById("timetext").value = "00时00分00秒000毫秒";
}
//报告计时结果函数
function tellTime() {
  stop();
  alert(
    "用时：" + document.getElementById("timetext").value + "。点击确定继续"
  );
  Reset();
}
