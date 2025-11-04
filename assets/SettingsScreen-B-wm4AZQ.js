import{r as t,j as e}from"./ui-vendor-JVI_EMCz.js";import{y as E,e as Q,z as F,A as J,o as D,C as L,D as Z,E as ee,b as re,d as te,F as se,G as ae,H as ie,I as O,J as ne,K as oe,u as V,L as M,N as G,O as q,P as le,Q as de,T as _,R as ce,S as pe,U as xe,V as ue,W as ge,l as he,m as me,X as fe,Y as be,Z as B,v as ve,_ as ye,$ as je,a0 as we,a1 as ke,a2 as Se,a3 as Ne}from"./index-C73-RRRc.js";import"./react-vendor-Bzgz95E1.js";import"./firebase-vendor-CyvWsNSE.js";const Ce=({onBack:b})=>{const[o,N]=t.useState(null),[l,v]=t.useState(""),[c,u]=t.useState(""),[g,x]=t.useState(""),[C,h]=t.useState(""),[m,y]=t.useState(!0),[j,w]=t.useState(""),[k,z]=t.useState(""),[R,f]=t.useState(!1),[r,a]=t.useState(!1),[n,S]=t.useState(!1),[P,d]=t.useState(""),[A,U]=t.useState(""),W=t.useRef(null),$=t.useRef(null);t.useEffect(()=>{X()},[]);const X=async()=>{try{const s=E.currentUser;if(!s)return;const i=await Q(s.uid);i&&(N(i),v(i.displayName),u(i.username),x(i.bio||""),h(i.websiteUrl||""),y(i.isPublic),w(i.avatarUrl||""),z(i.coverUrl||""))}catch(s){console.error("Load profile error:",s),d("プロフィールの読み込みに失敗しました")}},Y=async s=>{const i=s.target.files?.[0];if(!i)return;const I=O(i);if(!I.valid){d(I.error||"");return}a(!0),d("");try{const p=E.currentUser;if(!p)throw new Error("ログインが必要です");const T=await oe(p.uid,i);w(T),U("アイコン画像をアップロードしました")}catch(p){console.error("Avatar upload error:",p),d(p.message||"アイコン画像のアップロードに失敗しました")}finally{a(!1)}},H=async s=>{const i=s.target.files?.[0];if(!i)return;const I=O(i);if(!I.valid){d(I.error||"");return}S(!0),d("");try{const p=E.currentUser;if(!p)throw new Error("ログインが必要です");const T=await ne(p.uid,i);z(T),U("カバー画像をアップロードしました")}catch(p){console.error("Cover upload error:",p),d(p.message||"カバー画像のアップロードに失敗しました")}finally{S(!1)}},K=async()=>{d(""),U(""),f(!0);try{const s=E.currentUser;if(!s)throw new Error("ログインが必要です");if(!l.trim()){d("表示名を入力してください"),f(!1);return}const i=se(c);if(!i.valid){d(i.error||""),f(!1);return}if(c!==o?.username&&!await ae(c,s.uid)){d("このユーザー名は既に使用されています"),f(!1);return}await ie(s.uid,{displayName:l.trim(),username:c,bio:g.trim(),websiteUrl:C.trim(),isPublic:m,avatarUrl:j,coverUrl:k}),U("プロフィールを更新しました！"),setTimeout(()=>U(""),3e3)}catch(s){console.error("Save profile error:",s),d(s.message||"プロフィールの更新に失敗しました")}finally{f(!1)}};return e.jsxs("div",{className:"profile-edit-screen",children:[e.jsxs("div",{className:"profile-edit-header",children:[e.jsxs("button",{onClick:b,className:"back-button",children:[e.jsx(F,{})," 戻る"]}),e.jsx("h2",{children:"プロフィール編集"}),e.jsxs("button",{onClick:K,className:"save-button",disabled:R,children:[e.jsx(J,{})," ",R?"保存中...":"保存"]})]}),P&&e.jsx("div",{className:"error-message",children:P}),A&&e.jsx("div",{className:"success-message",children:A}),e.jsx("div",{className:"cover-section",children:e.jsxs("div",{className:"cover-image",style:{backgroundImage:k?`url(${k})`:"linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"},children:[e.jsxs("button",{onClick:()=>$.current?.click(),className:"cover-upload-button",disabled:n,children:[e.jsx(D,{})," ",n?"アップロード中...":"カバー画像を変更"]}),e.jsx("input",{ref:$,type:"file",accept:"image/*",onChange:H,style:{display:"none"}})]})}),e.jsx("div",{className:"avatar-section",children:e.jsxs("div",{className:"avatar-image",children:[j?e.jsx("img",{src:j,alt:"Avatar"}):e.jsx("div",{className:"avatar-placeholder",children:e.jsx(L,{size:60})}),e.jsx("button",{onClick:()=>W.current?.click(),className:"avatar-upload-button",disabled:r,children:e.jsx(D,{})}),e.jsx("input",{ref:W,type:"file",accept:"image/*",onChange:Y,style:{display:"none"}})]})}),e.jsxs("div",{className:"profile-form",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(L,{})," 表示名"]}),e.jsx("input",{type:"text",value:l,onChange:s=>v(s.target.value),placeholder:"山田太郎",maxLength:50}),e.jsxs("span",{className:"char-count",children:[l.length,"/50"]})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(Z,{})," ユーザー名"]}),e.jsxs("div",{className:"username-input",children:[e.jsx("span",{className:"username-prefix",children:"@"}),e.jsx("input",{type:"text",value:c,onChange:s=>u(s.target.value.toLowerCase()),placeholder:"yamada_taro",maxLength:20})]}),e.jsx("span",{className:"hint",children:"英数字とアンダースコア（_）のみ使用可能"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"自己紹介"}),e.jsx("textarea",{value:g,onChange:s=>x(s.target.value),placeholder:"あなたについて教えてください...",maxLength:200,rows:4}),e.jsxs("span",{className:"char-count",children:[g.length,"/200"]})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(ee,{})," WebサイトURL"]}),e.jsx("input",{type:"url",value:C,onChange:s=>h(s.target.value),placeholder:"https://example.com"})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{className:"toggle-label",children:[m?e.jsx(re,{}):e.jsx(te,{}),"プロフィールを公開する",e.jsx("input",{type:"checkbox",checked:m,onChange:s=>y(s.target.checked),className:"toggle-switch"})]}),e.jsx("span",{className:"hint",children:m?"誰でもあなたのプロフィールを閲覧できます":"フォロワーのみプロフィールを閲覧できます"})]})]}),e.jsx("style",{children:`
        .profile-edit-screen {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 80px;
        }

        .profile-edit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--card);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .profile-edit-header h2 {
          color: var(--text);
          font-size: 20px;
          margin: 0;
        }

        .back-button,
        .save-button {
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s;
        }

        .back-button {
          background: var(--background);
          color: var(--text);
        }

        .back-button:hover {
          background: var(--border);
        }

        .save-button {
          background: linear-gradient(135deg, var(--primary) 0%, #43a047 100%);
          color: white;
        }

        .save-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          margin: 16px;
          padding: 12px;
          background: #ffebee;
          color: #c62828;
          border-radius: 8px;
          font-size: 14px;
        }

        body.dark-mode .error-message {
          background: #b71c1c;
          color: #ffcdd2;
        }

        .success-message {
          margin: 16px;
          padding: 12px;
          background: #e8f5e9;
          color: #2e7d32;
          border-radius: 8px;
          font-size: 14px;
        }

        body.dark-mode .success-message {
          background: #1b5e20;
          color: #a5d6a7;
        }

        .cover-section {
          position: relative;
        }

        .cover-image {
          width: 100%;
          height: 200px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cover-upload-button {
          padding: 10px 20px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s;
        }

        .cover-upload-button:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.8);
        }

        .cover-upload-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .avatar-section {
          display: flex;
          justify-content: center;
          margin-top: -60px;
          padding: 0 16px;
        }

        .avatar-image {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid var(--card);
          background: var(--background);
          overflow: hidden;
        }

        .avatar-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background: var(--border);
        }

        .avatar-upload-button {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          border: 2px solid var(--card);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .avatar-upload-button:hover:not(:disabled) {
          transform: scale(1.1);
        }

        .avatar-upload-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .profile-form {
          padding: 32px 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: var(--text);
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-group label svg {
          color: var(--primary);
        }

        .form-group input,
        .form-group textarea {
          padding: 12px 16px;
          border: 2px solid var(--border);
          border-radius: 8px;
          font-size: 16px;
          background: var(--card);
          color: var(--text);
          transition: all 0.3s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          font-family: inherit;
        }

        .username-input {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .username-prefix {
          color: var(--text-secondary);
          font-size: 16px;
          font-weight: 500;
        }

        .username-input input {
          flex: 1;
        }

        .char-count,
        .hint {
          color: var(--text-secondary);
          font-size: 12px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .toggle-switch {
          margin-left: auto;
          width: 50px;
          height: 26px;
          appearance: none;
          background: var(--border);
          border-radius: 13px;
          position: relative;
          cursor: pointer;
          transition: background 0.3s;
        }

        .toggle-switch:checked {
          background: var(--primary);
        }

        .toggle-switch::before {
          content: '';
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: white;
          top: 2px;
          left: 2px;
          transition: transform 0.3s;
        }

        .toggle-switch:checked::before {
          transform: translateX(24px);
        }

        @media (max-width: 480px) {
          .cover-image {
            height: 150px;
          }

          .avatar-image {
            width: 100px;
            height: 100px;
          }

          .profile-form {
            padding: 24px 12px;
          }
        }
      `})]})},ze=({onBack:b})=>{const{user:o}=V(),[N,l]=t.useState([]),[v,c]=t.useState(!0),[u,g]=t.useState(!1),[x,C]=t.useState("all"),[h,m]=t.useState([]);t.useEffect(()=>{o&&y()},[o]);const y=async()=>{if(o){c(!0);try{const r=await M(o.uid);l(r);const a=await G(o.uid);if(a.length>0){m(a);const n=await M(o.uid);l(n)}}catch(r){console.error("称号取得エラー:",r)}finally{c(!1)}}},j=async()=>{if(o){g(!0);try{const r=await G(o.uid);r.length>0?(m(r),alert(`🎉 ${r.length}個の新しい称号を獲得しました！`)):alert("新しい称号はありません");const a=await M(o.uid);l(a)}catch(r){console.error("称号チェックエラー:",r),alert("称号チェックに失敗しました")}finally{g(!1)}}},w=async r=>{if(o)try{await ue(o.uid,r);const a=await M(o.uid);l(a)}catch(a){console.error("称号装備エラー:",a),alert("称号の装備に失敗しました")}},k=new Set(N.map(r=>r.titleId)),z=N.find(r=>r.isEquipped)?.titleId,R=x==="all"?q:q.filter(r=>r.category===x),f=[{id:"all",name:"すべて",icon:"📋"},{id:"beginner",name:"初心者",icon:"🎉"},{id:"poster",name:"投稿者",icon:"📝"},{id:"social",name:"ソーシャル",icon:"⭐"},{id:"recipe",name:"レシピ",icon:"🍳"},{id:"achievement",name:"アチーブメント",icon:"🏆"},{id:"prefecture",name:"都道府県",icon:"🗾"},{id:"special",name:"特別",icon:"👑"}];return e.jsxs("div",{style:{padding:"16px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[b&&e.jsx("button",{onClick:b,style:{background:"none",border:"none",cursor:"pointer",padding:"8px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"},onMouseEnter:r=>{r.currentTarget.style.background="var(--background)"},onMouseLeave:r=>{r.currentTarget.style.background="none"},children:e.jsx(F,{size:24,color:"var(--text)"})}),e.jsx("h2",{style:{fontSize:"24px",fontWeight:700,color:"var(--text)"},children:"称号"})]}),e.jsxs("button",{onClick:j,disabled:u,style:{display:"flex",alignItems:"center",gap:"8px",padding:"10px 16px",background:"var(--primary)",color:"white",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:600,cursor:u?"not-allowed":"pointer",opacity:u?.6:1,transition:"opacity 0.2s"},children:[e.jsx(le,{size:18,style:{animation:u?"spin 1s linear infinite":"none"}}),"チェック"]})]}),h.length>0&&e.jsxs("div",{style:{padding:"16px",background:"linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",borderRadius:"12px",marginBottom:"24px",border:"2px solid #fcd34d"},children:[e.jsxs("div",{style:{fontSize:"16px",fontWeight:700,color:"#92400e",marginBottom:"8px"},children:["🎉 ",h.length,"個の新しい称号を獲得しました！"]}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"8px"},children:h.map(r=>{const a=de(r);return a?e.jsx(_,{title:a,size:"small",showName:!0},r):null})})]}),e.jsx("div",{style:{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"8px",marginBottom:"24px"},children:f.map(r=>e.jsxs("button",{onClick:()=>C(r.id),style:{padding:"8px 16px",background:x===r.id?"var(--primary)":"var(--card)",color:x===r.id?"white":"var(--text)",border:`1px solid ${x===r.id?"var(--primary)":"var(--border)"}`,borderRadius:"20px",fontSize:"14px",fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s"},children:[e.jsx("span",{style:{marginRight:"6px"},children:r.icon}),r.name]},r.id))}),v?e.jsxs("div",{style:{textAlign:"center",padding:"40px",color:"var(--text-secondary)"},children:[e.jsx("div",{style:{width:"40px",height:"40px",margin:"0 auto 12px",border:"3px solid var(--border)",borderTopColor:"var(--primary)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}),"読み込み中..."]}):e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:R.map(r=>{const a=k.has(r.id),n=z===r.id;return e.jsxs("div",{style:{padding:"16px",background:a?"var(--card)":"var(--background)",border:"2px solid var(--border)",borderRadius:"12px",opacity:a?1:.5},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(_,{title:r,size:"medium",showName:!0}),n&&e.jsx("span",{style:{padding:"4px 8px",background:"var(--primary)",color:"white",borderRadius:"4px",fontSize:"12px",fontWeight:600},children:"装備中"})]}),a&&e.jsx("button",{onClick:()=>w(r.id),style:{padding:"8px 16px",background:n?"var(--primary)":"var(--background)",color:n?"white":"var(--text)",border:`1px solid ${n?"var(--primary)":"var(--border)"}`,borderRadius:"8px",fontSize:"14px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.2s"},children:n?e.jsxs(e.Fragment,{children:[e.jsx(ce,{size:18}),"装備中"]}):e.jsxs(e.Fragment,{children:[e.jsx(pe,{size:18}),"装備"]})})]}),e.jsx("div",{style:{fontSize:"13px",color:"var(--text-secondary)",marginBottom:"8px"},children:r.description}),!a&&e.jsxs("div",{style:{padding:"8px",background:"rgba(0, 0, 0, 0.05)",borderRadius:"6px",fontSize:"12px",color:"var(--text-secondary)",display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx(xe,{size:14}),"未獲得"]})]},r.id)})})]})},Me=()=>{const{settings:b,updateSettings:o,toggleDarkMode:N}=ge(),{intakes:l}=he(),{expenses:v}=me(),{stocks:c}=fe(),{user:u}=V(),[g,x]=t.useState((b.monthlyBudget??3e4).toString()),[C,h]=t.useState(!1),[m,y]=t.useState(!1),[j,w]=t.useState(!1),k=()=>{o({monthlyBudget:Number(g)}),alert("設定を保存しました！")},z=()=>{const r=["種類,名前,カロリー,金額,日付",...l.map(S=>`食事記録,${S.name},${S.calories},${S.price},${S.date}`)].join(`
`),a=new Blob([r],{type:"text/csv;charset=utf-8;"}),n=document.createElement("a");n.href=URL.createObjectURL(a),n.download=`健康家計アプリ_${new Date().toISOString().split("T")[0]}.csv`,n.click()},R=()=>{const r={intakes:l,expenses:v,stocks:c,settings:b,exportedAt:new Date().toISOString()},a=new Blob([JSON.stringify(r,null,2)],{type:"application/json"}),n=document.createElement("a");n.href=URL.createObjectURL(a),n.download=`健康家計アプリ_${new Date().toISOString().split("T")[0]}.json`,n.click()},f=async()=>{if(window.confirm("ログアウトしますか？")){const r=await Ne();r.error&&alert("ログアウトに失敗しました: "+r.error)}};return C?e.jsx(Ce,{onBack:()=>h(!1)}):m?e.jsx(ze,{onBack:()=>y(!1)}):j?e.jsx(be,{onBack:()=>w(!1)}):e.jsxs("section",{className:"screen active",children:[e.jsx("h2",{children:"設定"}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"プロフィール"}),e.jsxs("button",{className:"profile-edit-button",onClick:()=>h(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(L,{size:24,color:"var(--primary)"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"プロフィールを編集"})]}),e.jsx(B,{size:24,color:"var(--text-secondary)"})]}),e.jsxs("button",{onClick:()=>y(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(ve,{size:24,color:"#f59e0b"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"称号"})]}),e.jsx(B,{size:24,color:"var(--text-secondary)"})]}),e.jsxs("button",{onClick:()=>w(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(ye,{size:24,color:"#3b82f6"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"都道府県"})]}),e.jsx(B,{size:24,color:"var(--text-secondary)"})]}),e.jsx("p",{style:{fontSize:"0.9rem",color:"var(--text-secondary)",margin:"0"},children:"アイコン、名前、自己紹介などを編集"})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"月間予算"}),e.jsx("input",{type:"number",value:g,onChange:r=>x(r.target.value),placeholder:"30000"}),e.jsxs("button",{className:"submit",onClick:k,children:[e.jsx(J,{size:18,style:{marginRight:"8px"}}),"保存"]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"外観"}),e.jsxs("div",{className:"setting-item",children:[e.jsxs("div",{className:"setting-item-left",children:[e.jsx("div",{className:"setting-icon",children:e.jsx(je,{size:24})}),e.jsx("span",{className:"setting-label",children:"ダークモード"})]}),e.jsxs("label",{className:"toggle-switch",children:[e.jsx("input",{type:"checkbox",checked:b.darkMode,onChange:N}),e.jsx("span",{className:"toggle-slider"})]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"データエクスポート"}),e.jsxs("div",{style:{display:"flex",gap:"8px"},children:[e.jsxs("button",{className:"submit",onClick:z,style:{flex:1},children:[e.jsx(we,{size:18,style:{marginRight:"8px"}}),"CSV"]}),e.jsxs("button",{className:"submit",onClick:R,style:{flex:1},children:[e.jsx(ke,{size:18,style:{marginRight:"8px"}}),"JSON"]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"データ統計"}),e.jsxs("div",{style:{fontSize:"0.9rem",color:"var(--text-secondary, #666)"},children:[e.jsxs("p",{children:["食事記録: ",l.length,"件"]}),e.jsxs("p",{children:["支出記録: ",v.length,"件"]}),e.jsxs("p",{children:["在庫アイテム: ",c.length,"件"]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"アカウント"}),e.jsx("div",{style:{fontSize:"0.9rem",color:"var(--text-secondary, #666)",marginBottom:"12px"},children:e.jsxs("p",{children:["ログイン: ",u?.email]})}),e.jsxs("button",{className:"submit",onClick:f,style:{background:"linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",width:"100%"},children:[e.jsx(Se,{size:18,style:{marginRight:"8px"}}),"ログアウト"]})]})]})};export{Me as SettingsScreen};
