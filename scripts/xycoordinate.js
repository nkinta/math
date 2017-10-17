// xycoordinate.js
// ＝＝＝＝＝Ｘ－Ｙ軸系ＣＡＮＶＡＳ＝＝＝＝＝　作成者　木暮仁
//   setCanvas(canvasname, backcolor); 　　　　　　　　　　　　  ＣＡＮＶＡＳの定義  
// 　clearScreen(fillcolor); 　　　　　　　　　　　　　　　　　  画面全体を消す（１つの色で塗りつぶす）
// 　drawLine(x0,y0, x1,y1, linecolor,linewidth);　　　　　　　  直線
// 　drawPoint(x,y, pointcolor, pointsize);　　　　　　　　　　  点の色を変える
// 　drawRect(x0,y0, x1,y1, linecolor, linewidth, fillcolor);　  長方形
// 　drawCircle(x,y, r, linecolor, linewidth, fillcolor);　　　  円
// 　drawArc(x,y, r, startAngle, endAngle, type, linecolor, linewidth, fillcolor);　円弧・扇形
// 　drawTri(x0,y0, x1,y1, x2,y2, linecolor, linewidth, fillcolor); 　　　　　　　　三角形
// 　drawRegularPolygon(n, x,y, r, base, type, linecolor, linewidth, fillcolor);　　正多角形
// 　drawText(text, x,y, align, color, font);　　　　　　　　　  テキスト（文字列）
//   drawImage(image, x,y);                                      画像の表示
//   drawImageRatio(image, x,y, ratio);                          画像の縮小（拡大）表示
//   drawAxisGrid(option, axiscolor, axiswidth, linecolor, linewidth, xfrom, xto, yfrom, yto, dx,  dy);
//                                                               Ｘ軸、Ｙ軸、補助線を引く
//   drawAxisScale(xfrom, xto, yfrom, yto, color, dx, dy, font); Ｘ軸、Ｙ軸に目盛りをつける
// 　　－－－－－利用が限定的なもの
// 　paintArea(x,y, fillcolor);　　　　　　　　　　　　　　　　  点(x,y)が存在する領域に色を塗る
// 　sleep(time);　　　　　　　　　　　　　　　　　　　　　　　  時間を遅らせる
// 
// 
// ＨＴＭＬ５のＣＡＮＶＡＳ関連のJavaScript関数は、左上が原点でｙが増加すると下に下がる。
// ここでは、数学系の処理を容易にするために、画素数 cw*ch の物理的CANVASを、
// 左下 (xmin,ymin)、右上 (xmax,ymax) の仮想WINDOWとして取り扱えるようにしたものである。
//
// ●重要！！
// 利用条件（それぞれの関数を呼び出す以前に）
// １　cw,ch (HTMLのcanvasタグで設定したcanvasのwidthとheight）を定義して、
//   　setCanvas関数を呼び出しておくこと。
// ２　xmin, xmax, ymin, ymax を定義しておくこと
//　これらの６変数と「ctx」は、xycoordinate.jsをでグローバル変数にしています。
// 呼び出すスクリプトで、var宣言してローカル変数化してはなりません。
//
// 留意事項
// １　縦・横の比率が崩されないためには、xmax-xmin：ymax-ymin＝cw：ch の利率にするのが望ましい。
// ２　点表示などのキザミ幅は、画素との対応が適切なほうが画像が鮮明になる。
// 　　そのためにはxmax+xmin, ymax-ymin とcw, chが整数比にするのがよい。
//     例えば、cw = 400なのにxmin=10,xmax=27(xmax+xmin=37) などとするのは不適切である。
// 　　また、dx = (xmax+xmin)/cw*整数 とするとよい。
// ３　pointsizeやlinewidthなど、点の大きさや線の太さに関する変数の値は、画素数であり、
// 　　xminなどの仮想WINDOWの値には無関係である。
//
// 記述例
// <!DOCTYPE html>
// <head>
// <meta charset="UTF-8"></meta> （HTMLはUTF-8が望ましい)
// <script src="xycoordinate.js"></script> (このライブラリ。パスは状況により異なる）
// <script>
// function test() {
//     cw = 400;  ch = 400;　　　　　　　　　　　　　　─┬　これらの変数は必須
//     xmin = -40; xmax = 40;  ymin = -40; ymax = 40;　─┘　var をつけない！
//     setCanvas("canvas1", "black");　　──　必須　次にsetCanvasを与えるまで、すべての
//     drawPoint(20,10, "red", 6);                   functionはcanvas1を対象にする
//     drawLine(-20,-10, 15,25, "yellow", 2);
//　　　　：
//  }
// </script>
// </headl>
// <body>
// <form name="iform">
//  :
// <input type="button" value="実行" onclick="test()"></input>
// <canvas id="canvas1" width="400" height="400"></input>
// 　　　canvas1 は setCanvasのCANVAS名（任意）、widthとheightの値は、cwとchの値に一致させる
// ：
// 
//●fillcolorの透明度指定について、
// 　長方形(drawTri)や円（drawCircle)など領域の内部の色を指定するとき、
//  "red"や"white"など色名以外にrgb形式で与えることができる。
// 　例："rgba(255, 0, 0, 0.7)" 赤色。最後の0.7は透明度。
// 　透明度を与えるときは、rgb形式で与えなければならない。
// 
// 
// 


  //======================================================================
  //グローバル変数

  var cw, ch;
  var xmin, xmax, ymin, ymax;
  var ctx;
  //======================================================================
  //ＣＡＮＶＡＳの定義
function setCanvas(canvasname, backcolor) {
    //描画コンテキストの取得
    canvas = document.getElementById(canvasname);
    if ( ! canvas || ! canvas.getContext ) {
      return false;
    }
    /* 2Dコンテキスト */
    ctx = canvas.getContext('2d');
    //CANVASを黒く塗りつぶす
    ctx.fillStyle = backcolor;
    ctx.beginPath();
    ctx.fillRect(0,0,cw,ch);
    ctx.stroke();
}
     //例
     //●重要！　cw = 400; ch = 400;  これを記述しておく必要あり 　 ←┐
     //setCanvas("canvas1", "black");  canvas1はidで与えたcanvas名　←┤名称と値を
     //ＨＴＭＬでは 　　　　　　　　　　　　　　　　　　　　　　　　　│一致させる
     //<canvas id="canvas1" width="400" height="400"></canvas>　　　←┘

  //========================================================================
  //画面全体を消す（１つの色で塗りつぶす）
function clearScreen(fillcolor) {
    ctx.fillStyle = fillcolor; 
    ctx.beginPath();
    ctx.fillRect(0,0, cw,ch);
    ctx.stroke();
}
     //例　画面全体（背景色）を赤にする
     // drawRect("red");

  //========================================================================
  //直線を引く
function drawLine(x0,y0, x1,y1, linecolor,linewidth) {
    var cx0,cy0,cx1,cy1;
    cx0 = (x0-xmin)/(xmax-xmin)*cw;
    cy0 = (ymax-y0)/(ymax-ymin)*ch;
    cx1 = (x1-xmin)/(xmax-xmin)*cw;
    cy1 = (ymax-y1)/(ymax-ymin)*ch;
    ctx.strokeStyle = linecolor; //線の色 #xxxxxx でも red でもよい
    ctx.lineWidth = linewidth;   // 線の太さ 1, 2など
    ctx.beginPath();
    ctx.moveTo(cx0,cy0);
    ctx.lineTo(cx1,cy1);
    ctx.stroke();
    ctx.closePath();
}
     //例
     //Ｘ軸　  drawLine(0,ymin, 0,ymax, "aqua", 1);

  //========================================================================
  //点に色をつける。
function drawPoint(x,y, pointcolor, pointsize) {
    var cx, cy, d;
    cx =  (x-xmin)/(xmax-xmin)*cw;
    cy = (ymax-y)/(ymax-ymin)*ch;
    d = Math.floor((pointsize + 1)/2);
    ctx.fillStyle = pointcolor;
    ctx.fillRect(cx-d, cy-d, pointsize, pointsize);
}
     //例：pointsizeは画素数。の矩形）
     // drawPoint(x,y, "white", 4);


  //========================================================================
  //長方形を描く
function drawRect(x0,y0, x1,y1, linecolor, linewidth, fillcolor) {
    var cx0, cy0, cx1,cy1, w, h;
    cx0 = (x0-xmin)/(xmax-xmin)*cw;
    cy0 = (ymax-y0)/(ymax-ymin)*ch;
    cx1 = (x1-xmin)/(xmax-xmin)*cw;
    cy1 = (ymax-y1)/(ymax-ymin)*ch;
    w = cx1-cx0;
    h = cy1-cy0;
    ctx.strokeStyle = linecolor; // 枠線の色
    ctx.lineWidth = linewidth;   // 線の太さ
    if (fillcolor!="none") ctx.fillStyle = fillcolor; 
　　　　　//塗りつぶし（塗らないときは"none"）
    ctx.beginPath();
    ctx.rect(cx0, cy0, w,h);
    if (fillcolor != "none") ctx.fill();
    ctx.stroke();
}
     //例　(5,8)-(10,20)を対角線とした長方形の枠線を青の２の太さにして、その内部を赤にする
     // drawRect(5,8, 10,20, "blue", 2, "red");

  //========================================================================
  //円を描く
function drawCircle(x,y, r, linecolor, linewidth, fillcolor) {
    var cx, cy;
    cx = (x-xmin)/(xmax-xmin)*cw;
    cy = (ymax-y)/(ymax-ymin)*ch;
    cr = r*cw/(xmax-xmin);
    ctx.strokeStyle = linecolor; //枠線の色は白
    ctx.lineWidth = linewidth;   // 線の太さ
    if (fillcolor!="none") ctx.fillStyle = fillcolor; 
　　　　　//塗りつぶし（塗らないときは"none"）
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, 2*Math.PI, false);
    if (fillcolor != "none") ctx.fill();
    ctx.stroke();
}
     //例　原点中心、半径１、線は白、内部は灰色
     // drawCircle(0,0, 1, "white", 2, "gray");

  //========================================================================
  //円弧を描く
function drawArc(x,y, r, startAngle, endAngle, type, linecolor, linewidth, fillcolor) {
      var cx, cy, cr;
      cx = (x-xmin)/(xmax-xmin)*cw;
      cy = (ymax-y)/(ymax-ymin)*ch;
      cr = r*cw/(xmax-xmin);
      ctx.strokeStyle = linecolor;
      ctx.lineWidth = linewidth;
      // ============ 円弧だけの表示
      if (type == 0) {
          ctx.beginPath();
          ctx.arc(cx, cy, cr, startAngle, endAngle, false);
          ctx.stroke();
          ctx.closePath();
      }
      // ============ 円弧・リブを表示、内部色
      if (type == 1) {
          var p1x = x + r*Math.cos(endAngle);
          var p1y = y - r*Math.sin(endAngle);
          var p2x = x + r*Math.cos(startAngle);
          var p2y = y - r*Math.sin(startAngle);
          // ピクセル座標系への変更
          p1x = (p1x-xmin)/(xmax-xmin)*cw;
          p1y = (ymax-p1y)/(ymax-ymin)*ch;
          p2x = (p2x-xmin)/(xmax-xmin)*cw;
          p2y = (ymax-p2y)/(ymax-ymin)*ch;

          ctx.beginPath();
          // 円弧
          ctx.arc(cx, cy, cr, startAngle, endAngle, false); 
          // リブ
          ctx.moveTo(p2x,p2y);
          ctx.lineTo(cx,cy);
          ctx.lineTo(p1x,p1y);
          // 
          if (fillcolor != "none") {
              ctx.fillStyle = fillcolor; 
              ctx.fill();
          }
          ctx.stroke();
          ctx.closePath();
      }
}
  // 
  //パラメタ
  // 　x,y, r：円の中心座標と半径
  // 　startAngle, endAngle：円弧の起点・終点角度、Ｘ軸から時計回り。どちらを起点にするかに注意
  // 　　右下３０°～４５°startAngle= (1/6)*Math.PI, endAngle= (1/4)*Math.PI
  // 　　右上３０°～４５°startAngle=-(1/4)*Math.PI, endAngle=-(1/6)*Math.PI 
  // 　type：＝０　円弧だけ、＝１　扇形で内部色も
  // 　linecolor,linewidth：線の色と太さ。円弧もリブも同じ。円弧の線を変えたいときは、
  // 　　まずtest=1で全体を描き、次にtest=2で円弧だけを描けばよい。
  // 　fillcolor：扇形の内部色。塗らないときは"none"
  //例 drawArc(0.3, 0.6, 1, (1/6)*Math.PI, (3/4)*Math.PI, 1, "red", 4, "yellow");
  // 　中心(0.3, 0.6)、半径１の円のうち、Ｘ軸から時計回り（右下方向）に３０°～４５°の円弧について
  // 　扇形を表示。"red"色で太さ４、内部は"yellow"色
  // 

  //========================================================================
  //三角形を描く
function drawTri(x0,y0, x1,y1, x2,y2, linecolor, linewidth, fillcolor) {
    var cx0, cy0, cx1,cy1, cx2,cy2;
    cx0 = (x0-xmin)/(xmax-xmin)*cw;
    cy0 = (ymax-y0)/(ymax-ymin)*ch;
    cx1 = (x1-xmin)/(xmax-xmin)*cw;
    cy1 = (ymax-y1)/(ymax-ymin)*ch;
    cx2 = (x2-xmin)/(xmax-xmin)*cw;
    cy2 = (ymax-y2)/(ymax-ymin)*ch;

    ctx.strokeStyle = linecolor; // 枠線の色
    ctx.lineWidth = linewidth;   // 線の太さ
    if (fillcolor!="none") ctx.fillStyle = fillcolor; 
　　　　　//塗りつぶし（塗らないときは"none"）
    ctx.beginPath();
    ctx.moveTo(cx0, cy0);
    ctx.lineTo(cx1, cy1);
    ctx.lineTo(cx2, cy2);
    ctx.closePath();
    if (fillcolor != "none") ctx.fill();
    ctx.stroke();
}
     //例　(10,5)-(20,10)-(30,5)を頂点とする三角形の枠線を青の２の太さにして、その内部を赤にする
     // drawTri(10,5, 20,10, 30,5, "blue", 2, "red");

// ========================================================================
// 正多角形の描画
//　中心(x,y)、半径ｒの円に内接する正ｎ角形。選択により対角線表示

function drawRegularPolygon(n, x,y, r, base, type, linecolor, linewidth, fillcolor) {
      var d;                 // 辺の長さ
      var a0;
      var u = new Array();   // 頂点座標
      var v = new Array();
      if (base == 0) {
          d = 2*r*Math.sin(Math.PI/n);
          a0 = (2/n)*Math.PI;
          u[0] = x + r*Math.sin(Math.PI/n);
          v[0] = y - r*Math.cos(Math.PI/n);
      }
      else {
          d = 2*r*Math.sin(Math.PI/n);
          a0 = Math.PI/n;
          u[0] = x;
          v[0] = y - r;
      }
      // 頂点の計算をする
      for (var i=1; i<n; i++) {
          a = a0+ (2/n)*Math.PI*(i-1);
          u[i] = u[i-1] + d*Math.cos(a);
          v[i] = v[i-1] + d*Math.sin(a);
      }
      u[n] = u[0];  v[n] = v[0];   // i=nの点を最初点と一致させる。後続のループを簡単にするため

      // ============== ここからは、図形操作のためピクセル座標系に変更
      // u,vをピクセル系に変換する
      for (i=0; i<=n; i++) {
          u[i] = (u[i]-xmin)/(xmax-xmin)*cw;
          v[i] = (ymax-v[i])/(ymax-ymin)*ch;
      }
      // 図形の色や太さ
      ctx.fillStyle = fillcolor;
      ctx.strokeStyle = linecolor; // 枠線の色
      ctx.lineWidth = linewidth;   // 線の太さ
      if (fillcolor!="none") ctx.fillStyle = fillcolor; 
      // 多角形の周辺を描画する
      if (type != 1) {
          ctx.beginPath();
          ctx.moveTo(u[0], v[0]);
          for (i=1; i<=n; i++) {
              ctx.lineTo(u[i], v[i]);
          }
          ctx.closePath();
          if (fillcolor != "none")  ctx.fill(); 
          ctx.stroke();
      }
      // 対角線を描画する　線が消えるので内部色は付けない
      if (type != 0) {
          for (i=0; i<n; i++) {
              for (var j=i+2; j<=n-2+i; j++) {
                  ctx.beginPath();
                  ctx.moveTo(u[i], v[i]);
                  ctx.lineTo(u[j], v[j]);
                  ctx.stroke();
                  ctx.closePath();
              }
          }
      }            
}
  //パラメータ
  // n： 　　≧３　ｎ角形、辺・頂点の数
  // x,y： 　正多角形の外接円の中心座標
  // r： 　　その半径
  // base：　＝０　円中心の下が底辺、＝１　円中心の下が頂点
  // type：　＝０　周辺のみを表示、＝１　対角線だけを表示、＝２　周辺と対角線を表示　　　　　
  // linecolor：線（周辺、対角線）の太さ
  // fillcolor：正多角形内部の色。　塗らないときは "none"
  //          ●対角線を結んだ図形だけに色を塗ることはできない（線が消える）
  // 
  //例  drawRegularPolygon(5, 0.3, 0.5, 1, 0, 2, "white", 4, "red");
  // 　点(0.3, 0.5)を中心とする半径１の円に内接する正５角形を描画する。
  // 　中心点の下は底辺（底辺がＸ軸に平行）であり、正多角形と対角線を表示する
  // 　線は"white"色太さは４px。正多角形の内部は"red"色


  // ========================================================================
  // テキスト（文字列）を描く
function drawText(text, x,y, align, color, font) {
               // text 　文字列　描くべき文字列　例　"Ｐ(0, 20)"
               // x,y　　数値　　表示位置　ｘ上に表示される（下に表示したいときは、適宜ｘを変更する）
               // align　文字列　"start"（既定）, "end", "left", "right", "center"
               // color　文字列　文字の色　"black", "white", "red",・・・指定しないと直前の色
               // font 　文字列　CSSでの表示と同じ　例： "14px 'ＭＳ ゴシック'" ・・・指定しないと直前
      var cx = (x-xmin)/(xmax-xmin)*cw;
      var cy = (ymax-y)/(ymax-ymin)*ch;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.font = font;
      ctx.textAlign = align;
      ctx.strokeText(text, cx, cy);
}
    // 例　(10,20)の右上に "グラフＡ" を表示する（既定のまま）
    //     drawText("グラフＡ", 10,20);
    // 例　(10,0)の下に"10"を"red"の"12px 'ＭＳ 明朝'"で表示する
    //     drawText("10", 10, -0.2, "center", "red", "12px 'ＭＳ 明朝'");
    // 　　　　　　　　　　　　└下に表示するための調整

  // ========================================================================
  // 画像ファイルを表示する
function drawImage(image, x,y) {
           // url：画像ファイルのＵＲＬ
           // x, y：画像の左上隅のcanvasでの表示位置
      var img = new Image();
      img.src = image + "?" + new Date().getTime();
      var cx = (x-xmin)/(xmax-xmin)*cw;
      var cy = (ymax-y)/(ymax-ymin)*ch;
      img.onload = function() {
          ctx.drawImage(img, cx, cy, img.width, img.height);
      }
}

  // ========================================================================
  // 画像ファイルを縮小（拡大）表示する
function drawImageRatio(image, x,y, ratio) {
           // url：画像ファイルのＵＲＬ
           // x, y：画像の左上隅のcanvasでの表示位置
           // ratio：=0.5（縦横２５％に縮尺）、=2（縦横２倍に拡大）
      var img = new Image();
      img.src = image + "?" + new Date().getTime();
      var cx = (x-xmin)/(xmax-xmin)*cw;
      var cy = (ymax-y)/(ymax-ymin)*ch;
      img.onload = function() {
          var w = ratio*img.width;
          var h = ratio*img.height;
          ctx.drawImage(img, cx, cy, w, h);
      }
}

  //========================================================================
  //Ｘ軸、Ｙ軸、補助線を引く
function drawAxisGrid(option, axiscolor, axiswidth, linecolor, linewidth, xfrom, xto, yfrom, yto, dx, dy) {
    // 必須なのは、option, axiscolor, axiswidthのみ。他は省略可能
    // 省略時解釈
    if (linecolor == null) linecolor = axiscolor; // 軸と同色
    if (linewidth == null) linewidth = Math.ceil(axiswidth/2); // 補助線太さは軸線の半分
    if (xfrom == null) xfrom = xmin;
    if (xto == null) xto = xmax;
    if (yfrom == null) yfrom = ymin;
    if (yto == null) yto = ymax;
    if (dx == null) dx = 1;
    if (dy == null) dy = 1;
    // cw,ch系での位置
    var cx0 = -xmin/(xmax-xmin)*cw;  // x=0の位置
    var cxmin = 0; // x=xmin
    var cxmax = cw; // x=xmax
    var cy0 = ymax/(ymax-ymin)*ch;   // y=0
    var cymin = ch; // y=ymin
    var cymax = 0; // y=ymax
    // Ｘ軸、Ｙ軸
    ctx.strokeStyle = axiscolor;
    ctx.lineWidth = axiswidth;
    ctx.beginPath();
    ctx.moveTo(cxmin,cy0);
    ctx.lineTo(cxmax,cy0);
    ctx.stroke();
    ctx.moveTo(cx0,cymin);
    ctx.lineTo(cx0,cymax);
    ctx.stroke();
    ctx.closePath();
    if (option == "axis") return;
    // 補助線
    ctx.strokeStyle = linecolor;
    ctx.lineWidth = linewidth;
    // 水平補助線
    if (option != "y") {
      ctx.beginPath();
      for (var y=yfrom; y<=yto; y=y+dy) {
        if (y == 0) continue;
        var cy = (ymax-y)/(ymax-ymin)*ch;
        ctx.moveTo(cxmin,cy);
        ctx.lineTo(cxmax,cy);
        ctx.stroke();
      }
      ctx.closePath();
    }
    // 垂直補助線
    if (option != "x") {
      ctx.beginPath();
      for (var x=xfrom; x<=xto; x=x+dx) {
        if (x == 0) continue;
        var cx = (x-xmin)/(xmax-xmin)*cw
        ctx.moveTo(cx,cymin);
        ctx.lineTo(cx,cymax);
        ctx.stroke();
      }
      ctx.closePath();
    }

}
  // パラメータ
  // 必須なのは、option, axiscolor, axiswidth
  // option = "all" Ｘ軸、Ｙ軸、補助線を引く
  //        = "axis" Ｘ軸、Ｙ軸のみ
  //        = "x" 水平方向のみ（Ｘ軸およびＸ軸に平行な補助線）
  //        = "y" 垂直方向のみ（Ｙ軸およびＹ軸に平行な補助線）
  // axiscolor, axiswidth： 軸の色と線の太さ
  //
  // 他は省略可能だが、省略した後のパラメタを指定するとはできない
  // linecolor, linewidth： 補助線の色と線の太さ
  // 　　　省略時：linecolor＝軸と同色、linewidth＝軸の半分の太さ
  // xfrom, xto：Ｘ軸に垂直な補助線の開始点と終了点
  // 　　　省略時：xminとxmaxになる。それらが（整数でないなど）半端な値のときに指定する
  // dx：補助線の間隔。省略時は１
  // yfrom, yto, dy：同上。Ｘ軸に平行な補助線　　　　
  // 例  drawAxisGrid("axis", "red", 2);
  // 　赤で太さ２のＸＹ軸だけを引く。
  // 例  drawAxisGrid("all", "red",2);
  // 　赤で太さ２のＸＹ軸と、黄で太さ１の補助線をxmin,xmin+1,～,xmaxの点で垂直、ymin,ymin+1,～,ymaxの点で平行に引く 
  // 例  drawAxisGrid("y", "red",2, "yellow", 1, -2, 4);
  // 　赤で太さ２のＸＹ軸と、黄で太さ１の補助線を -2,-1,～4の点で垂直に引く。水平の補助線は引かない。
  // 例  drawAxisGrid("y", "red",2, , , -2, 4);
  //   エラー。中間のパラメータは省略できない（dyを指定するには全パラメータを指定する必要がある）。
  // 注意　drawAxisScaleと併用する場合
  //     xfrom, xto などの整合性に考慮する
  //     目盛り数値を明瞭表示するために、drawAxisScaleより前に実行するのが望ましい。

  //========================================================================
  // Ｘ軸・Ｙ軸に目盛り数値をつける
function drawAxisScale(xfrom, xto, yfrom, yto, color, dx, dy, font) {
    if (color == null) color = "black";
    if (dx == null) dx = 1;
    if (dy == null) dy = 1;
    if (font == null) font = 12;
    font = font + "pt Arial";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.font = font;
    // Ｘ軸
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (var x=xfrom; x<=xto; x=x+dx) {
        var cx = (x-xmin)/(xmax-xmin)*cw;
        var cy = ymax/(ymax-ymin)*ch;
        var text = new String(x);
        ctx.strokeText(text, cx, cy);
    }
    // Ｙ軸
    ctx.textAlign = "end";
    ctx.textBaseline = "middle";
    for (var y=yfrom; y<=yto; y=y+dy) {
        if (y == 0) continue;
        var cx = -xmin/(xmax-xmin)*cw;
        var cy = (ymax-y)/(ymax-ymin)*ch;
        var text = new String(y);
        ctx.strokeText(text, cx, cy);
    }
}
  // 　必須なのは、xfrom, xto, yfrom, ytoのみ。
  //   他は省略可能だが、省略した後のパラメタを指定するとはできない
  // xfrom, xto, dx：Ｘ軸の xfrom, xfrom+dx, xfrom+2*dx,～,xto の点に目盛り数値をつける。Ｘ軸の下
  //   dxを省略すると１になる。
  //   xfrom, xto は次の理由で必須である（xmin, xmaxで代用できない）
  //      xmin,xmax の目盛り数値がCANVASをはみ出してしまう
  //      xmin,xmax の値が（整数ではないなど）半端な数値だと、目盛りも半端な数値になり不自然になる。
  // yfrom, yto, dy：上と同様。Ｙ軸の目盛り。Ｙ軸の左。０点はＸ軸を優先し、ここではつけない。
  // color：目盛り数値の色。省略時は "black"
  // font：目盛り数値の大きさ。16pt ならば 16 とする。省略時は12
  // 例　drawAxisScale(-2, 4, -4, 2);
  //      Ｘ軸：-2,-1,～,6　Ｙ軸：-4,-3,～,2 に目盛りをつける。黒で12pt
  // 例　drawAxisScale(-2, 4, -4, 2, "red", 16);
  //      同上の個所に、赤で16ptの目盛りをつける。


// ★★★★★★★★　やや特殊な用途、使用法に注意が必要な関数　★★★★★★★★

// ========================================================================
// 指定した点(x,y)を囲む図形の内部をfillcolor色で塗りつぶす。
// ★fillcolorは、"red"や"white"などの形式のみです。rgba形式は使えません。
// ★該当する領域のすべてが変更されないことがあります。
// 　実際に表示させてみて、(x,y)を変えてみるか、
// 　異なる(x,y)でpaintAreaを数回呼び出して埋めることで対応します。

function paintArea(x,y, fillcolor) {
    // パラメタ
    var cx = Math.round((x-xmin)/(xmax-xmin)*cw);   // xに対応するピクセルの位置
    var cy = Math.round((ymax-y)/(ymax-ymin)*ch);   // yに対応するピクセルの位置
                                                    // fillcolor="red","green" などの文字列
    var rgbOld = new Array();       // Ｐ点の元の色
    // ===================== ＣＡＮＶＡＳ情報を配列PIXELに
    // canvas とpixel[i][j][c] の関連づけ
    var ctxImage = ctx.getImageData(0, 0, cw, ch);
    var inData  = ctxImage.data;
    // pixel[i][j][c] の定義　canvasの各画素をマトリクスに対応させる
         // i：canvas縦方向ピクセル番号　上端=0, 下端=ch
         // j：canvas横方向ピクセル番号　左端=0, 右端=cw
         // c：０=赤、１=緑、２=青、３＝透明度
    var pixel = new Array(ch);
    for (var i=0; i<ch; i++) {
        pixel[i] = new Array(cw);
        for (var j=0; j<cw; j++) {
            pixel[i][j] = new Array(4);
        }
    }
    // canvas全体の色情報をpixel[i][j][c]に読み込む
    var k = 0;
    for (i=0; i<ch; i++) {
        for (j=0; j<cw; j++) {
            for (c=0; c<=3; c++) {
                pixel[i][j][c] = inData[k];
                k++;
            }
        }
    }
    // =======================塗りつぶし処理
    // 点Ｐの元の色 
    rgbOld[0] = pixel[cx][cy][0];
    rgbOld[1] = pixel[cx][cy][1];
    rgbOld[2] = pixel[cx][cy][2];
    // ======= 右下象限
    // 横にスキャン
    i = cy;
    while (i < ch) {
        count = 0;
        j = cx;
        while (j < cw) {         // 右へ
            if ( ( pixel[i][j][0] != rgbOld[0] )
             ||  ( pixel[i][j][1] != rgbOld[1] )
             ||  ( pixel[i][j][2] != rgbOld[2] ) ) {  // 色がＰ点と変わった
                break;                                // 　→境界に達した→次の下の行へ
            }
            else {                                // 同じ色なら
                ctx.lineWidth = 1;
                ctx.fillStyle   = fillcolor;
                ctx.beginPath(); 
                ctx.fillRect(j, i, 1, 1);
                ctx.fill();
                ctx.stroke();             // (i,j) に指定i色で 1x1 の長方形を描くi
                count++;                          // この行で変更した回数
            }
            j++;     // 右のピクセルへ
        }                         // この行で右側の境界に達した
        if (count == 0) break;    // この行では変更しなかった→次の行では変更がないはず→縦にスキャン
        i++;                      // 次の下の行へ。
    }
                             // 終了条件：count=0 or i=ch
    // 縦にスキャン
    j = cx;
    while (j < cw) {
        count = 0;
        i = cy;
        while (i < ch) {         // 下へ
            if ( ( pixel[i][j][0] != rgbOld[0] )
             ||  ( pixel[i][j][1] != rgbOld[1] )
             ||  ( pixel[i][j][2] != rgbOld[2] ) ) {  // 色がＰ点と変わった
                break;                                // 　→境界に達した→次の下の行へ
            }
            else {                                // 同じ色なら
                ctx.lineWidth = 1;
                ctx.fillStyle   = fillcolor;
                ctx.beginPath(); 
                ctx.fillRect(j, i, 1, 1);
                ctx.fill();
                ctx.stroke();             // (i,j) に指定i色で 1x1 の長方形を描くi
                count++;                          // この行で変更した回数
            }
            i++;     // 下のピクセルへ
        }                         // この列で下側の境界に達した
        if (count == 0) break;    // この列では変更しなかった→次の列の変更がないはず→他の象限へ
        j++;                      // 下の行へ。
    }                             // 終了条件：count=0 or i=ch
    // ======= 右上象限
    // 
    i = cy-1;
    while (i >= 0) {
        count = 0;
        j = cx;
        while (j < cw) {
            if ( ( pixel[i][j][0] != rgbOld[0] )
             ||  ( pixel[i][j][1] != rgbOld[1] )
             ||  ( pixel[i][j][2] != rgbOld[2] ) ) {
                break;
            }
            else {
                ctx.lineWidth = 1;
                ctx.fillStyle   = fillcolor;
                ctx.beginPath(); 
                ctx.fillRect(j, i, 1, 1);
                ctx.fill();
                ctx.stroke();
                count++;
            }
            j++;
        }
        if (count == 0) break;
        i--;
    }
    // 
    j = cx;
    while (j < cw) {
        count = 0;
       i = cy-1;
        while (i >= 0) {
            if ( ( pixel[i][j][0] != rgbOld[0] )
             ||  ( pixel[i][j][1] != rgbOld[1] )
             ||  ( pixel[i][j][2] != rgbOld[2] ) ) {
                break;
            }
            else {
                ctx.lineWidth = 1;
                ctx.fillStyle   = fillcolor;
                ctx.beginPath(); 
                ctx.fillRect(j, i, 1, 1);
                ctx.fill();
                ctx.stroke();
                count++;
            }
            i++;
        }
        if (count == 0) break;
        j--;
    }
    // ======= 左下象限
    // 
    i = cy;
    while (i < ch) {
        count = 0;
        j = cx-1;
        while (j >= 0) {         // 右へ
            if ( ( pixel[i][j][0] != rgbOld[0] )
             ||  ( pixel[i][j][1] != rgbOld[1] )
             ||  ( pixel[i][j][2] != rgbOld[2] ) ) {
                break;
            }
            else {
                ctx.lineWidth = 1;
                ctx.fillStyle   = fillcolor;
                ctx.beginPath(); 
                ctx.fillRect(j, i, 1, 1);
                ctx.fill();
                ctx.stroke();
                count++;
            }
            j--;
        }
        if (count == 0) break;
        i++;
    }
    // 
    j = cx-1;
    while (j >= 0) {
        count = 0;
        i = cy;
        while (i < ch) {         // 右へ
            if ( ( pixel[i][j][0] != rgbOld[0] )
             ||  ( pixel[i][j][1] != rgbOld[1] )
             ||  ( pixel[i][j][2] != rgbOld[2] ) ) {
                break;
            }
            else {
                ctx.lineWidth = 1;
                ctx.fillStyle   = fillcolor;
                ctx.beginPath(); 
                ctx.fillRect(j, i, 1, 1);
                ctx.fill();
                ctx.stroke();
                count++;
            }
            i--;
        }
        if (count == 0) break;
        j++;
    }



    // ======= 左上象限
    //
    i = cy-1;
    while (i >= 0) {
        count = 0;
        j = cx-1;
        while (j >= 0) {
            if ( ( pixel[i][j][0] != rgbOld[0] )
             ||  ( pixel[i][j][1] != rgbOld[1] )
             ||  ( pixel[i][j][2] != rgbOld[2] ) ) {
                break;
            }
            else {
                ctx.lineWidth = 1;
                ctx.fillStyle   = fillcolor;
                ctx.beginPath(); 
                ctx.fillRect(j, i, 1, 1);
                ctx.fill();
                ctx.stroke();
                count++;
            }
            j--;
        }
        if (count == 0) break;
        i--;
    }
    // 
    j = cx-1;
    while (j >= 0) {
        count = 0;
        i = cy-1;
        while (i >= 0) {
            if ( ( pixel[i][j][0] != rgbOld[0] )
             ||  ( pixel[i][j][1] != rgbOld[1] )
             ||  ( pixel[i][j][2] != rgbOld[2] ) ) {
                break;
            }
            else {
                ctx.lineWidth = 1;
                ctx.fillStyle   = fillcolor;
                ctx.beginPath(); 
                ctx.fillRect(j, i, 1, 1);
                ctx.fill();
                ctx.stroke();
                count++;
            }
            i--;
        }
        if (count == 0) break;
        j--;
    }
}
// ===================
// 　画面変更は、現在のcanvas全体のピクセルを配列pixelにコピーし、
// 　変更後、配列pixel全体をcanvasに書き込むことにより行う。
// 　(x,y)に対応するピクセル表示点Ｐ(cx,cy)から上下左右に、ピクセルをスキャンし、
// 　Ｐと異なる色のピクセル（すなわち、囲む図形の境界）に出会うまで、
// 　そのピクセルをfillcolor色に変更する。
// ★fillcolorは、"red"や"white"などの形式のみです。rgba形式は使えません。
// ★該当する領域が点Ｐからみて凸でなければ、塗りつぶせない部分が発生します。
// 　領域内に文字などがあっても凸になりません。
// 　凸であっても、塗りつぶせない部分が発生することがありそうです。
// 　　　実際に表示させてみて、(x,y)を変えてみるか、
// 　　　異なる(x,y)でpaintAreaを数回呼び出して埋めることで対応します。
// 例
// 次のような画面があるとします。
// 　　cw = 400;  ch = 400;
// 　　xmin =-2; xmax=2; ymin=-2; ymax=2;
// 　　setCanvas("canvas1", "yellow");
// 　　drawCircle(0,0, 1, "green", 1, "white");
// 　　drawLine(-2, 0, 2,0, "black", 1);
// 　　drawLine( 0,-2, 0,2, "black", 1);
// 　　drawLine(-2,-2, 2,1, "blue", 1);
// 点(0.3, 0.5)を含む領域を"red"にします。
// 　　paintArea(0.3, 0.5, "red");


  //========================================================================
  //時間を遅らせる（他言語のSleepやWaitの機能）
function sleep(time) {
      var d1 = new Date().getTime();
      var d2 = new Date().getTime();
      alert("２回目以降「このページ～」にチェックを入れてください");
      while( d2 < d1 + time ){
          d2 = new Date().getTime();
      }
}
  // これはGoogle Chrome以外では使わないでください。
  // その場合でもalertを外すと、うまく動きません。

