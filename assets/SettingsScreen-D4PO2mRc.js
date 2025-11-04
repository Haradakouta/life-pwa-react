import{r as s,j as e}from"./ui-vendor-JVI_EMCz.js";import{y as I,e as Q,z as F,A as J,o as $,C as M,D as Z,E as ee,b as re,d as te,F as ae,G as se,H as ie,I as D,J as ne,K as oe,u as V,L as E,N as O,O as G,P as le,Q as de,T as q,R as ce,S as pe,U as xe,V as ue,W as ge,l as he,m as me,X as fe,Y as _,v as be,Z as ve,_ as ye,$ as je,a0 as we,a1 as ke}from"./index-F-M53ki5.js";import"./react-vendor-Bzgz95E1.js";import"./firebase-vendor-CyvWsNSE.js";const Se=({onBack:v})=>{const[n,S]=s.useState(null),[o,y]=s.useState(""),[c,h]=s.useState(""),[m,u]=s.useState(""),[N,f]=s.useState(""),[b,j]=s.useState(!0),[w,C]=s.useState(""),[k,z]=s.useState(""),[l,p]=s.useState(!1),[r,t]=s.useState(!1),[g,B]=s.useState(!1),[L,d]=s.useState(""),[A,U]=s.useState(""),P=s.useRef(null),W=s.useRef(null);s.useEffect(()=>{X()},[]);const X=async()=>{try{const a=I.currentUser;if(!a)return;const i=await Q(a.uid);i&&(S(i),y(i.displayName),h(i.username),u(i.bio||""),f(i.websiteUrl||""),j(i.isPublic),C(i.avatarUrl||""),z(i.coverUrl||""))}catch(a){console.error("Load profile error:",a),d("プロフィールの読み込みに失敗しました")}},Y=async a=>{const i=a.target.files?.[0];if(!i)return;const R=D(i);if(!R.valid){d(R.error||"");return}t(!0),d("");try{const x=I.currentUser;if(!x)throw new Error("ログインが必要です");const T=await oe(x.uid,i);C(T),U("アイコン画像をアップロードしました")}catch(x){console.error("Avatar upload error:",x),d(x.message||"アイコン画像のアップロードに失敗しました")}finally{t(!1)}},H=async a=>{const i=a.target.files?.[0];if(!i)return;const R=D(i);if(!R.valid){d(R.error||"");return}B(!0),d("");try{const x=I.currentUser;if(!x)throw new Error("ログインが必要です");const T=await ne(x.uid,i);z(T),U("カバー画像をアップロードしました")}catch(x){console.error("Cover upload error:",x),d(x.message||"カバー画像のアップロードに失敗しました")}finally{B(!1)}},K=async()=>{d(""),U(""),p(!0);try{const a=I.currentUser;if(!a)throw new Error("ログインが必要です");if(!o.trim()){d("表示名を入力してください"),p(!1);return}const i=ae(c);if(!i.valid){d(i.error||""),p(!1);return}if(c!==n?.username&&!await se(c,a.uid)){d("このユーザー名は既に使用されています"),p(!1);return}await ie(a.uid,{displayName:o.trim(),username:c,bio:m.trim(),websiteUrl:N.trim(),isPublic:b,avatarUrl:w,coverUrl:k}),U("プロフィールを更新しました！"),setTimeout(()=>U(""),3e3)}catch(a){console.error("Save profile error:",a),d(a.message||"プロフィールの更新に失敗しました")}finally{p(!1)}};return e.jsxs("div",{className:"profile-edit-screen",children:[e.jsxs("div",{className:"profile-edit-header",children:[e.jsxs("button",{onClick:v,className:"back-button",children:[e.jsx(F,{})," 戻る"]}),e.jsx("h2",{children:"プロフィール編集"}),e.jsxs("button",{onClick:K,className:"save-button",disabled:l,children:[e.jsx(J,{})," ",l?"保存中...":"保存"]})]}),L&&e.jsx("div",{className:"error-message",children:L}),A&&e.jsx("div",{className:"success-message",children:A}),e.jsx("div",{className:"cover-section",children:e.jsxs("div",{className:"cover-image",style:{backgroundImage:k?`url(${k})`:"linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"},children:[e.jsxs("button",{onClick:()=>W.current?.click(),className:"cover-upload-button",disabled:g,children:[e.jsx($,{})," ",g?"アップロード中...":"カバー画像を変更"]}),e.jsx("input",{ref:W,type:"file",accept:"image/*",onChange:H,style:{display:"none"}})]})}),e.jsx("div",{className:"avatar-section",children:e.jsxs("div",{className:"avatar-image",children:[w?e.jsx("img",{src:w,alt:"Avatar"}):e.jsx("div",{className:"avatar-placeholder",children:e.jsx(M,{size:60})}),e.jsx("button",{onClick:()=>P.current?.click(),className:"avatar-upload-button",disabled:r,children:e.jsx($,{})}),e.jsx("input",{ref:P,type:"file",accept:"image/*",onChange:Y,style:{display:"none"}})]})}),e.jsxs("div",{className:"profile-form",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(M,{})," 表示名"]}),e.jsx("input",{type:"text",value:o,onChange:a=>y(a.target.value),placeholder:"山田太郎",maxLength:50}),e.jsxs("span",{className:"char-count",children:[o.length,"/50"]})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(Z,{})," ユーザー名"]}),e.jsxs("div",{className:"username-input",children:[e.jsx("span",{className:"username-prefix",children:"@"}),e.jsx("input",{type:"text",value:c,onChange:a=>h(a.target.value.toLowerCase()),placeholder:"yamada_taro",maxLength:20})]}),e.jsx("span",{className:"hint",children:"英数字とアンダースコア（_）のみ使用可能"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"自己紹介"}),e.jsx("textarea",{value:m,onChange:a=>u(a.target.value),placeholder:"あなたについて教えてください...",maxLength:200,rows:4}),e.jsxs("span",{className:"char-count",children:[m.length,"/200"]})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(ee,{})," WebサイトURL"]}),e.jsx("input",{type:"url",value:N,onChange:a=>f(a.target.value),placeholder:"https://example.com"})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{className:"toggle-label",children:[b?e.jsx(re,{}):e.jsx(te,{}),"プロフィールを公開する",e.jsx("input",{type:"checkbox",checked:b,onChange:a=>j(a.target.checked),className:"toggle-switch"})]}),e.jsx("span",{className:"hint",children:b?"誰でもあなたのプロフィールを閲覧できます":"フォロワーのみプロフィールを閲覧できます"})]})]}),e.jsx("style",{children:`
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
      `})]})},Ne=({onBack:v})=>{const{user:n}=V(),[S,o]=s.useState([]),[y,c]=s.useState(!0),[h,m]=s.useState(!1),[u,N]=s.useState("all"),[f,b]=s.useState([]);s.useEffect(()=>{n&&j()},[n]);const j=async()=>{if(n){c(!0);try{const r=await E(n.uid);o(r);const t=await O(n.uid);if(t.length>0){b(t);const g=await E(n.uid);o(g)}}catch(r){console.error("称号取得エラー:",r)}finally{c(!1)}}},w=async()=>{if(n){m(!0);try{const r=await O(n.uid);r.length>0?(b(r),alert(`🎉 ${r.length}個の新しい称号を獲得しました！`)):alert("新しい称号はありません");const t=await E(n.uid);o(t)}catch(r){console.error("称号チェックエラー:",r),alert("称号チェックに失敗しました")}finally{m(!1)}}},C=async r=>{if(n)try{await ue(n.uid,r);const t=await E(n.uid);o(t)}catch(t){console.error("称号装備エラー:",t),alert("称号の装備に失敗しました")}},k=new Set(S.map(r=>r.titleId)),z=S.find(r=>r.isEquipped)?.titleId,l=u==="all"?G:G.filter(r=>r.category===u),p=[{id:"all",name:"すべて",icon:"📋"},{id:"beginner",name:"初心者",icon:"🎉"},{id:"poster",name:"投稿者",icon:"📝"},{id:"social",name:"ソーシャル",icon:"⭐"},{id:"recipe",name:"レシピ",icon:"🍳"},{id:"achievement",name:"アチーブメント",icon:"🏆"},{id:"special",name:"特別",icon:"👑"}];return e.jsxs("div",{style:{padding:"16px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[v&&e.jsx("button",{onClick:v,style:{background:"none",border:"none",cursor:"pointer",padding:"8px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"},onMouseEnter:r=>{r.currentTarget.style.background="var(--background)"},onMouseLeave:r=>{r.currentTarget.style.background="none"},children:e.jsx(F,{size:24,color:"var(--text)"})}),e.jsx("h2",{style:{fontSize:"24px",fontWeight:700,color:"var(--text)"},children:"称号"})]}),e.jsxs("button",{onClick:w,disabled:h,style:{display:"flex",alignItems:"center",gap:"8px",padding:"10px 16px",background:"var(--primary)",color:"white",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:600,cursor:h?"not-allowed":"pointer",opacity:h?.6:1,transition:"opacity 0.2s"},children:[e.jsx(le,{size:18,style:{animation:h?"spin 1s linear infinite":"none"}}),"チェック"]})]}),f.length>0&&e.jsxs("div",{style:{padding:"16px",background:"linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",borderRadius:"12px",marginBottom:"24px",border:"2px solid #fcd34d"},children:[e.jsxs("div",{style:{fontSize:"16px",fontWeight:700,color:"#92400e",marginBottom:"8px"},children:["🎉 ",f.length,"個の新しい称号を獲得しました！"]}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"8px"},children:f.map(r=>{const t=de(r);return t?e.jsx(q,{title:t,size:"small",showName:!0},r):null})})]}),e.jsx("div",{style:{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"8px",marginBottom:"24px"},children:p.map(r=>e.jsxs("button",{onClick:()=>N(r.id),style:{padding:"8px 16px",background:u===r.id?"var(--primary)":"var(--card)",color:u===r.id?"white":"var(--text)",border:`1px solid ${u===r.id?"var(--primary)":"var(--border)"}`,borderRadius:"20px",fontSize:"14px",fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s"},children:[e.jsx("span",{style:{marginRight:"6px"},children:r.icon}),r.name]},r.id))}),y?e.jsxs("div",{style:{textAlign:"center",padding:"40px",color:"var(--text-secondary)"},children:[e.jsx("div",{style:{width:"40px",height:"40px",margin:"0 auto 12px",border:"3px solid var(--border)",borderTopColor:"var(--primary)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}),"読み込み中..."]}):e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:l.map(r=>{const t=k.has(r.id),g=z===r.id;return e.jsxs("div",{style:{padding:"16px",background:t?"var(--card)":"var(--background)",border:"2px solid var(--border)",borderRadius:"12px",opacity:t?1:.5},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(q,{title:r,size:"medium",showName:!0}),g&&e.jsx("span",{style:{padding:"4px 8px",background:"var(--primary)",color:"white",borderRadius:"4px",fontSize:"12px",fontWeight:600},children:"装備中"})]}),t&&e.jsx("button",{onClick:()=>C(r.id),style:{padding:"8px 16px",background:g?"var(--primary)":"var(--background)",color:g?"white":"var(--text)",border:`1px solid ${g?"var(--primary)":"var(--border)"}`,borderRadius:"8px",fontSize:"14px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.2s"},children:g?e.jsxs(e.Fragment,{children:[e.jsx(ce,{size:18}),"装備中"]}):e.jsxs(e.Fragment,{children:[e.jsx(pe,{size:18}),"装備"]})})]}),e.jsx("div",{style:{fontSize:"13px",color:"var(--text-secondary)",marginBottom:"8px"},children:r.description}),!t&&e.jsxs("div",{style:{padding:"8px",background:"rgba(0, 0, 0, 0.05)",borderRadius:"6px",fontSize:"12px",color:"var(--text-secondary)",display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx(xe,{size:14}),"未獲得"]})]},r.id)})})]})},Ie=()=>{const{settings:v,updateSettings:n,toggleDarkMode:S}=ge(),{intakes:o}=he(),{expenses:y}=me(),{stocks:c}=fe(),{user:h}=V(),[m,u]=s.useState((v.monthlyBudget??3e4).toString()),[N,f]=s.useState(!1),[b,j]=s.useState(!1),w=()=>{n({monthlyBudget:Number(m)}),alert("設定を保存しました！")},C=()=>{const l=["種類,名前,カロリー,金額,日付",...o.map(t=>`食事記録,${t.name},${t.calories},${t.price},${t.date}`)].join(`
`),p=new Blob([l],{type:"text/csv;charset=utf-8;"}),r=document.createElement("a");r.href=URL.createObjectURL(p),r.download=`健康家計アプリ_${new Date().toISOString().split("T")[0]}.csv`,r.click()},k=()=>{const l={intakes:o,expenses:y,stocks:c,settings:v,exportedAt:new Date().toISOString()},p=new Blob([JSON.stringify(l,null,2)],{type:"application/json"}),r=document.createElement("a");r.href=URL.createObjectURL(p),r.download=`健康家計アプリ_${new Date().toISOString().split("T")[0]}.json`,r.click()},z=async()=>{if(window.confirm("ログアウトしますか？")){const l=await ke();l.error&&alert("ログアウトに失敗しました: "+l.error)}};return N?e.jsx(Se,{onBack:()=>f(!1)}):b?e.jsx(Ne,{onBack:()=>j(!1)}):e.jsxs("section",{className:"screen active",children:[e.jsx("h2",{children:"設定"}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"プロフィール"}),e.jsxs("button",{className:"profile-edit-button",onClick:()=>f(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(M,{size:24,color:"var(--primary)"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"プロフィールを編集"})]}),e.jsx(_,{size:24,color:"var(--text-secondary)"})]}),e.jsxs("button",{onClick:()=>j(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(be,{size:24,color:"#f59e0b"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"称号"})]}),e.jsx(_,{size:24,color:"var(--text-secondary)"})]}),e.jsx("p",{style:{fontSize:"0.9rem",color:"var(--text-secondary)",margin:"0"},children:"アイコン、名前、自己紹介などを編集"})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"月間予算"}),e.jsx("input",{type:"number",value:m,onChange:l=>u(l.target.value),placeholder:"30000"}),e.jsxs("button",{className:"submit",onClick:w,children:[e.jsx(J,{size:18,style:{marginRight:"8px"}}),"保存"]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"外観"}),e.jsxs("div",{className:"setting-item",children:[e.jsxs("div",{className:"setting-item-left",children:[e.jsx("div",{className:"setting-icon",children:e.jsx(ve,{size:24})}),e.jsx("span",{className:"setting-label",children:"ダークモード"})]}),e.jsxs("label",{className:"toggle-switch",children:[e.jsx("input",{type:"checkbox",checked:v.darkMode,onChange:S}),e.jsx("span",{className:"toggle-slider"})]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"データエクスポート"}),e.jsxs("div",{style:{display:"flex",gap:"8px"},children:[e.jsxs("button",{className:"submit",onClick:C,style:{flex:1},children:[e.jsx(ye,{size:18,style:{marginRight:"8px"}}),"CSV"]}),e.jsxs("button",{className:"submit",onClick:k,style:{flex:1},children:[e.jsx(je,{size:18,style:{marginRight:"8px"}}),"JSON"]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"データ統計"}),e.jsxs("div",{style:{fontSize:"0.9rem",color:"var(--text-secondary, #666)"},children:[e.jsxs("p",{children:["食事記録: ",o.length,"件"]}),e.jsxs("p",{children:["支出記録: ",y.length,"件"]}),e.jsxs("p",{children:["在庫アイテム: ",c.length,"件"]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"アカウント"}),e.jsx("div",{style:{fontSize:"0.9rem",color:"var(--text-secondary, #666)",marginBottom:"12px"},children:e.jsxs("p",{children:["ログイン: ",h?.email]})}),e.jsxs("button",{className:"submit",onClick:z,style:{background:"linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",width:"100%"},children:[e.jsx(we,{size:18,style:{marginRight:"8px"}}),"ログアウト"]})]})]})};export{Ie as SettingsScreen};
