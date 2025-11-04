import{r as s,j as e}from"./ui-vendor-JVI_EMCz.js";import{b as S,a as q,M as F,c as $,d as D,e as M,f as X,i as Y,j as G,k as H,v as K,l as Q,m as Z,n as ee,o as re,p as ae,q as se,u as te,r as oe,t as ne,w as ie,x as le,y as ce,z as de}from"./index-B8qdfcdn.js";import{v as O,u as pe,a as ue}from"./imageUpload-1gDJP0O1.js";import"./react-vendor-Bzgz95E1.js";import"./firebase-vendor-mxbbJSnD.js";const xe=({onBack:h})=>{const[C,U]=s.useState(null),[c,m]=s.useState(""),[d,j]=s.useState(""),[p,y]=s.useState(""),[k,b]=s.useState(""),[u,w]=s.useState(!0),[f,N]=s.useState(""),[t,x]=s.useState(""),[i,l]=s.useState(!1),[_,E]=s.useState(!1),[R,L]=s.useState(!1),[I,o]=s.useState(""),[P,v]=s.useState(""),A=s.useRef(null),B=s.useRef(null);s.useEffect(()=>{J()},[]);const J=async()=>{try{const r=S.currentUser;if(!r)return;const a=await q(r.uid);a&&(U(a),m(a.displayName),j(a.username),y(a.bio||""),b(a.websiteUrl||""),w(a.isPublic),N(a.avatarUrl||""),x(a.coverUrl||""))}catch(r){console.error("Load profile error:",r),o("プロフィールの読み込みに失敗しました")}},T=async r=>{const a=r.target.files?.[0];if(!a)return;const g=O(a);if(!g.valid){o(g.error||"");return}E(!0),o("");try{const n=S.currentUser;if(!n)throw new Error("ログインが必要です");const z=await ue(n.uid,a);N(z),v("アイコン画像をアップロードしました")}catch(n){console.error("Avatar upload error:",n),o(n.message||"アイコン画像のアップロードに失敗しました")}finally{E(!1)}},V=async r=>{const a=r.target.files?.[0];if(!a)return;const g=O(a);if(!g.valid){o(g.error||"");return}L(!0),o("");try{const n=S.currentUser;if(!n)throw new Error("ログインが必要です");const z=await pe(n.uid,a);x(z),v("カバー画像をアップロードしました")}catch(n){console.error("Cover upload error:",n),o(n.message||"カバー画像のアップロードに失敗しました")}finally{L(!1)}},W=async()=>{o(""),v(""),l(!0);try{const r=S.currentUser;if(!r)throw new Error("ログインが必要です");if(!c.trim()){o("表示名を入力してください"),l(!1);return}const a=K(d);if(!a.valid){o(a.error||""),l(!1);return}if(d!==C?.username&&!await Q(d,r.uid)){o("このユーザー名は既に使用されています"),l(!1);return}await Z(r.uid,{displayName:c.trim(),username:d,bio:p.trim(),websiteUrl:k.trim(),isPublic:u,avatarUrl:f,coverUrl:t}),v("プロフィールを更新しました！"),setTimeout(()=>v(""),3e3)}catch(r){console.error("Save profile error:",r),o(r.message||"プロフィールの更新に失敗しました")}finally{l(!1)}};return e.jsxs("div",{className:"profile-edit-screen",children:[e.jsxs("div",{className:"profile-edit-header",children:[e.jsxs("button",{onClick:h,className:"back-button",children:[e.jsx(F,{})," 戻る"]}),e.jsx("h2",{children:"プロフィール編集"}),e.jsxs("button",{onClick:W,className:"save-button",disabled:i,children:[e.jsx($,{})," ",i?"保存中...":"保存"]})]}),I&&e.jsx("div",{className:"error-message",children:I}),P&&e.jsx("div",{className:"success-message",children:P}),e.jsx("div",{className:"cover-section",children:e.jsxs("div",{className:"cover-image",style:{backgroundImage:t?`url(${t})`:"linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"},children:[e.jsxs("button",{onClick:()=>B.current?.click(),className:"cover-upload-button",disabled:R,children:[e.jsx(D,{})," ",R?"アップロード中...":"カバー画像を変更"]}),e.jsx("input",{ref:B,type:"file",accept:"image/*",onChange:V,style:{display:"none"}})]})}),e.jsx("div",{className:"avatar-section",children:e.jsxs("div",{className:"avatar-image",children:[f?e.jsx("img",{src:f,alt:"Avatar"}):e.jsx("div",{className:"avatar-placeholder",children:e.jsx(M,{size:60})}),e.jsx("button",{onClick:()=>A.current?.click(),className:"avatar-upload-button",disabled:_,children:e.jsx(D,{})}),e.jsx("input",{ref:A,type:"file",accept:"image/*",onChange:T,style:{display:"none"}})]})}),e.jsxs("div",{className:"profile-form",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(M,{})," 表示名"]}),e.jsx("input",{type:"text",value:c,onChange:r=>m(r.target.value),placeholder:"山田太郎",maxLength:50}),e.jsxs("span",{className:"char-count",children:[c.length,"/50"]})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(X,{})," ユーザー名"]}),e.jsxs("div",{className:"username-input",children:[e.jsx("span",{className:"username-prefix",children:"@"}),e.jsx("input",{type:"text",value:d,onChange:r=>j(r.target.value.toLowerCase()),placeholder:"yamada_taro",maxLength:20})]}),e.jsx("span",{className:"hint",children:"英数字とアンダースコア（_）のみ使用可能"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"自己紹介"}),e.jsx("textarea",{value:p,onChange:r=>y(r.target.value),placeholder:"あなたについて教えてください...",maxLength:200,rows:4}),e.jsxs("span",{className:"char-count",children:[p.length,"/200"]})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(Y,{})," WebサイトURL"]}),e.jsx("input",{type:"url",value:k,onChange:r=>b(r.target.value),placeholder:"https://example.com"})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{className:"toggle-label",children:[u?e.jsx(G,{}):e.jsx(H,{}),"プロフィールを公開する",e.jsx("input",{type:"checkbox",checked:u,onChange:r=>w(r.target.checked),className:"toggle-switch"})]}),e.jsx("span",{className:"hint",children:u?"誰でもあなたのプロフィールを閲覧できます":"フォロワーのみプロフィールを閲覧できます"})]})]}),e.jsx("style",{children:`
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
      `})]})},ve=()=>{const{settings:h,updateSettings:C,toggleDarkMode:U}=ee(),{intakes:c}=re(),{expenses:m}=ae(),{stocks:d}=se(),{user:j}=te(),[p,y]=s.useState((h.monthlyBudget??3e4).toString()),[k,b]=s.useState(!1),u=()=>{C({monthlyBudget:Number(p)}),alert("設定を保存しました！")},w=()=>{const t=["種類,名前,カロリー,金額,日付",...c.map(l=>`食事記録,${l.name},${l.calories},${l.price},${l.date}`)].join(`
`),x=new Blob([t],{type:"text/csv;charset=utf-8;"}),i=document.createElement("a");i.href=URL.createObjectURL(x),i.download=`健康家計アプリ_${new Date().toISOString().split("T")[0]}.csv`,i.click()},f=()=>{const t={intakes:c,expenses:m,stocks:d,settings:h,exportedAt:new Date().toISOString()},x=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),i=document.createElement("a");i.href=URL.createObjectURL(x),i.download=`健康家計アプリ_${new Date().toISOString().split("T")[0]}.json`,i.click()},N=async()=>{if(window.confirm("ログアウトしますか？")){const t=await de();t.error&&alert("ログアウトに失敗しました: "+t.error)}};return k?e.jsx(xe,{onBack:()=>b(!1)}):e.jsxs("section",{className:"screen active",children:[e.jsx("h2",{children:"設定"}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"プロフィール"}),e.jsxs("button",{className:"profile-edit-button",onClick:()=>b(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(M,{size:24,color:"var(--primary)"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"プロフィールを編集"})]}),e.jsx(oe,{size:24,color:"var(--text-secondary)"})]}),e.jsx("p",{style:{fontSize:"0.9rem",color:"var(--text-secondary)",margin:"0"},children:"アイコン、名前、自己紹介などを編集"})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"月間予算"}),e.jsx("input",{type:"number",value:p,onChange:t=>y(t.target.value),placeholder:"30000"}),e.jsxs("button",{className:"submit",onClick:u,children:[e.jsx($,{size:18,style:{marginRight:"8px"}}),"保存"]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"外観"}),e.jsxs("div",{className:"setting-item",children:[e.jsxs("div",{className:"setting-item-left",children:[e.jsx("div",{className:"setting-icon",children:e.jsx(ne,{size:24})}),e.jsx("span",{className:"setting-label",children:"ダークモード"})]}),e.jsxs("label",{className:"toggle-switch",children:[e.jsx("input",{type:"checkbox",checked:h.darkMode,onChange:U}),e.jsx("span",{className:"toggle-slider"})]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"データエクスポート"}),e.jsxs("div",{style:{display:"flex",gap:"8px"},children:[e.jsxs("button",{className:"submit",onClick:w,style:{flex:1},children:[e.jsx(ie,{size:18,style:{marginRight:"8px"}}),"CSV"]}),e.jsxs("button",{className:"submit",onClick:f,style:{flex:1},children:[e.jsx(le,{size:18,style:{marginRight:"8px"}}),"JSON"]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"データ統計"}),e.jsxs("div",{style:{fontSize:"0.9rem",color:"var(--text-secondary, #666)"},children:[e.jsxs("p",{children:["食事記録: ",c.length,"件"]}),e.jsxs("p",{children:["支出記録: ",m.length,"件"]}),e.jsxs("p",{children:["在庫アイテム: ",d.length,"件"]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"アカウント"}),e.jsx("div",{style:{fontSize:"0.9rem",color:"var(--text-secondary, #666)",marginBottom:"12px"},children:e.jsxs("p",{children:["ログイン: ",j?.email]})}),e.jsxs("button",{className:"submit",onClick:N,style:{background:"linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",width:"100%"},children:[e.jsx(ce,{size:18,style:{marginRight:"8px"}}),"ログアウト"]})]})]})};export{ve as SettingsScreen};
