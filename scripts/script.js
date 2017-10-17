
//　include 最も基本的な機能
//            include(targetURL,srcTag,targetDiv)
//　　targetURL　取り込まれるＵＲＬ
//　　srcTag　　 取り込まれる範囲のタグ
//　　targetDiv　挿入位置
function include(targetURL,srcTag,targetDiv){
  var httpoj = createHttpRequest();
  httpoj.open('GET',targetURL,true);
  httpoj.onreadystatechange = function(){
      if (httpoj.readyState==4){
        if (httpoj.responseText=="") return;
        document.getElementById(targetDiv).innerHTML = getTagContent(httpoj,srcTag);
      }
  }
  httpoj.send(null);
}




//　includehonbun  タグ honbun で囲まれた範囲の取り込み
//            includehonbun(targetDiv)
//    targetDiv　　　 下の　stat-pc　
//　　　targetURL　取り込まれるＵＲＬ webtext/stat-pc/index.html
//　　　srcTag　　 常に "honbun"
//　　　targetDiv　stat-pc 
function includehonbun(targetDiv){
    targetURL = "../" + targetDiv + "/index.html";
    srcTag = "honbun";
    include(targetURL,srcTag,targetDiv);
}


//　includeSentakuMondai 選択問題
//            sentakumondai(targetDiv)
//　　targetDiv　取り込まれる問題番号　ad03-05
//　　srcTag　　 取り込まれる範囲のタグ ad03-05 
//　　targetURL　取り込まれるファイル sentaku-mondai/ad03.html

function includeSentakuMondai(targetDiv){
    srcTag = targetDiv;
    targetURL = "../sentaku-mondai/" + targetDiv.substring(0,targetDiv.indexOf("-"))+".html";
    include(targetURL,srcTag,targetDiv);
}



function includeHTML(targetURL,targetDiv,srcTag){
    var httpoj = createHttpRequest();
    httpoj.open('GET',targetURL,true);
    httpoj.onreadystatechange = function(){
        if (httpoj.readyState==4){
             document.getElementById(targetDiv).innerHTML = getTagContent(httpoj,srcTag);
        }
    }
    httpoj.send();
}




function getTagContent(oj,srcTag){
  var res  = oj.responseText;
  var bunsyou = res.replace(/[\n\r]/g,"");
  bunsyou = bunsyou.match("< *"+srcTag+" *>(.*)< */ *"+srcTag+" *>","i");
  return RegExp.$1;
}


//XMLHttpRequestオブジェクト生成
function createHttpRequest(){
  if(window.ActiveXObject){
         try {
          return new ActiveXObject("Msxml2.XMLHTTP");
         }
         catch (e) {
             try {
              return new ActiveXObject("Microsoft.XMLHTTP");
             }
             catch (e2) {
              return null;
             }
         }
  }
  else if(window.XMLHttpRequest) return new XMLHttpRequest();
  else return null;
}



//----------------------------------------------------------------
// 表示・非表示
// <a href="Javascript:ChangeActive('aaad');">☆</a>
//
// <div id="aaad" class="inactive">
//   .......
// </div>

function ChangeActive(ActiveID) {
    with (document.getElementById(ActiveID))
    className = (className == "active") ?
    "inactive" : "active";
}




//----------------------------------------------------------------
function keyword(item){
   var item ; 
   var url;
   url = "../keyword.html#" + item  ;
   window.open(url,"tempwindow","WIDTH=360,HEIGHT=120,RESIZABLE=1,SCROLLBARS=1,TOOLBAR=0,MENUBAR=0,LOCATION=0,STATUS=0,DIRECTORIES=0");
} ;  

