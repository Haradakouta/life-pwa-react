import{r as s,j as e}from"./ui-vendor-JVI_EMCz.js";import{A as E,e as K,C as P,D as Q,q as _,E as D,F as ie,G as oe,b as le,d as de,H as ce,I as pe,J as xe,K as J,L as ue,N as ge,u as L,O as W,P as V,Q as X,R as Z,S as he,T as Y,U as $,V as q,W as fe,X as me,n as ee,o as re,x as O,v as ye,Y as be,Z as ve,_ as je,$ as T,a0 as we,a1 as ke,a2 as Se,a3 as Ce,a4 as ze,a5 as Ne,a6 as Re,a7 as Ie}from"./index-S_7h3L6f.js";import{g as Me,a as Ue,d as Be,c as Te}from"./mission-C4aqhzaE.js";import{g as Ee,c as H,e as We,p as Pe}from"./cosmetic-7oeCqSip.js";import"./react-vendor-Bzgz95E1.js";import"./firebase-vendor-CBmCTztv.js";const Le=({onBack:b})=>{const[a,f]=s.useState(null),[u,k]=s.useState(""),[m,g]=s.useState(""),[v,p]=s.useState(""),[S,j]=s.useState(""),[w,C]=s.useState(!0),[n,y]=s.useState(""),[r,o]=s.useState(""),[x,h]=s.useState(!1),[B,I]=s.useState(!1),[M,t]=s.useState(!1),[i,d]=s.useState(""),[N,R]=s.useState(""),F=s.useRef(null),G=s.useRef(null);s.useEffect(()=>{te()},[]);const te=async()=>{try{const l=E.currentUser;if(!l)return;const c=await K(l.uid);c&&(f(c),k(c.displayName),g(c.username),p(c.bio||""),j(c.websiteUrl||""),C(c.isPublic),y(c.avatarUrl||""),o(c.coverUrl||""))}catch(l){console.error("Load profile error:",l),d("プロフィールの読み込みに失敗しました")}},se=async l=>{const c=l.target.files?.[0];if(!c)return;const U=J(c);if(!U.valid){d(U.error||"");return}I(!0),d("");try{const z=E.currentUser;if(!z)throw new Error("ログインが必要です");const A=await ge(z.uid,c);y(A),R("アイコン画像をアップロードしました")}catch(z){console.error("Avatar upload error:",z),d(z.message||"アイコン画像のアップロードに失敗しました")}finally{I(!1)}},ae=async l=>{const c=l.target.files?.[0];if(!c)return;const U=J(c);if(!U.valid){d(U.error||"");return}t(!0),d("");try{const z=E.currentUser;if(!z)throw new Error("ログインが必要です");const A=await ue(z.uid,c);o(A),R("カバー画像をアップロードしました")}catch(z){console.error("Cover upload error:",z),d(z.message||"カバー画像のアップロードに失敗しました")}finally{t(!1)}},ne=async()=>{d(""),R(""),h(!0);try{const l=E.currentUser;if(!l)throw new Error("ログインが必要です");if(!u.trim()){d("表示名を入力してください"),h(!1);return}const c=ce(m);if(!c.valid){d(c.error||""),h(!1);return}if(m!==a?.username&&!await pe(m,l.uid)){d("このユーザー名は既に使用されています"),h(!1);return}await xe(l.uid,{displayName:u.trim(),username:m,bio:v.trim(),websiteUrl:S.trim(),isPublic:w,avatarUrl:n,coverUrl:r}),R("プロフィールを更新しました！"),setTimeout(()=>R(""),3e3)}catch(l){console.error("Save profile error:",l),d(l.message||"プロフィールの更新に失敗しました")}finally{h(!1)}};return e.jsxs("div",{className:"profile-edit-screen",children:[e.jsxs("div",{className:"profile-edit-header",children:[e.jsxs("button",{onClick:b,className:"back-button",children:[e.jsx(P,{})," 戻る"]}),e.jsx("h2",{children:"プロフィール編集"}),e.jsxs("button",{onClick:ne,className:"save-button",disabled:x,children:[e.jsx(Q,{})," ",x?"保存中...":"保存"]})]}),i&&e.jsx("div",{className:"error-message",children:i}),N&&e.jsx("div",{className:"success-message",children:N}),e.jsx("div",{className:"cover-section",children:e.jsxs("div",{className:"cover-image",style:{backgroundImage:r?`url(${r})`:"linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"},children:[e.jsxs("button",{onClick:()=>G.current?.click(),className:"cover-upload-button",disabled:M,children:[e.jsx(_,{})," ",M?"アップロード中...":"カバー画像を変更"]}),e.jsx("input",{ref:G,type:"file",accept:"image/*",onChange:ae,style:{display:"none"}})]})}),e.jsx("div",{className:"avatar-section",children:e.jsxs("div",{className:"avatar-image",children:[n?e.jsx("img",{src:n,alt:"Avatar"}):e.jsx("div",{className:"avatar-placeholder",children:e.jsx(D,{size:60})}),e.jsx("button",{onClick:()=>F.current?.click(),className:"avatar-upload-button",disabled:B,children:e.jsx(_,{})}),e.jsx("input",{ref:F,type:"file",accept:"image/*",onChange:se,style:{display:"none"}})]})}),e.jsxs("div",{className:"profile-form",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(D,{})," 表示名"]}),e.jsx("input",{type:"text",value:u,onChange:l=>k(l.target.value),placeholder:"山田太郎",maxLength:50}),e.jsxs("span",{className:"char-count",children:[u.length,"/50"]})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(ie,{})," ユーザー名"]}),e.jsxs("div",{className:"username-input",children:[e.jsx("span",{className:"username-prefix",children:"@"}),e.jsx("input",{type:"text",value:m,onChange:l=>g(l.target.value.toLowerCase()),placeholder:"yamada_taro",maxLength:20})]}),e.jsx("span",{className:"hint",children:"英数字とアンダースコア（_）のみ使用可能"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"自己紹介"}),e.jsx("textarea",{value:v,onChange:l=>p(l.target.value),placeholder:"あなたについて教えてください...",maxLength:200,rows:4}),e.jsxs("span",{className:"char-count",children:[v.length,"/200"]})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(oe,{})," WebサイトURL"]}),e.jsx("input",{type:"url",value:S,onChange:l=>j(l.target.value),placeholder:"https://example.com"})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{className:"toggle-label",children:[w?e.jsx(le,{}):e.jsx(de,{}),"プロフィールを公開する",e.jsx("input",{type:"checkbox",checked:w,onChange:l=>C(l.target.checked),className:"toggle-switch"})]}),e.jsx("span",{className:"hint",children:w?"誰でもあなたのプロフィールを閲覧できます":"フォロワーのみプロフィールを閲覧できます"})]})]}),e.jsx("style",{children:`
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
      `})]})},Ae=({onBack:b})=>{const{user:a}=L(),[f,u]=s.useState([]),[k,m]=s.useState(!0),[g,v]=s.useState(!1),[p,S]=s.useState("all"),[j,w]=s.useState([]),[C,n]=s.useState(void 0);s.useEffect(()=>{a&&(r(),y())},[a]);const y=async()=>{if(a)try{const t=await K(a.uid);n(t?.prefecture)}catch(t){console.error("プロフィール取得エラー:",t)}},r=async()=>{if(a){m(!0);try{const t=await W(a.uid);u(t);const i=await V(a.uid);if(i.length>0){w(i);const d=await W(a.uid);u(d)}}catch(t){console.error("称号取得エラー:",t)}finally{m(!1)}}},o=async()=>{if(a){v(!0);try{const t=await V(a.uid);t.length>0?(w(t),alert(`🎉 ${t.length}個の新しい称号を獲得しました！`)):alert("新しい称号はありません");const i=await W(a.uid);u(i)}catch(t){console.error("称号チェックエラー:",t),alert("称号チェックに失敗しました")}finally{v(!1)}}},x=async t=>{if(a)try{await me(a.uid,t);const i=await W(a.uid);u(i)}catch(i){console.error("称号装備エラー:",i),alert("称号の装備に失敗しました")}},h=new Set(f.map(t=>t.titleId)),B=f.find(t=>t.isEquipped)?.titleId,I=(p==="all"?X:X.filter(t=>t.category===p)).filter(t=>t.condition.prefectureCode?t.condition.prefectureCode===C:!0),M=[{id:"all",name:"すべて",icon:"📋"},{id:"beginner",name:"初心者",icon:"🎉"},{id:"poster",name:"投稿者",icon:"📝"},{id:"social",name:"ソーシャル",icon:"⭐"},{id:"recipe",name:"レシピ",icon:"🍳"},{id:"achievement",name:"アチーブメント",icon:"🏆"},{id:"prefecture",name:"都道府県",icon:"🗾"},{id:"special",name:"特別",icon:"👑"}];return e.jsxs("div",{style:{padding:"16px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[b&&e.jsx("button",{onClick:b,style:{background:"none",border:"none",cursor:"pointer",padding:"8px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"},onMouseEnter:t=>{t.currentTarget.style.background="var(--background)"},onMouseLeave:t=>{t.currentTarget.style.background="none"},children:e.jsx(P,{size:24,color:"var(--text)"})}),e.jsx("h2",{style:{fontSize:"24px",fontWeight:700,color:"var(--text)"},children:"称号"})]}),e.jsxs("button",{onClick:o,disabled:g,style:{display:"flex",alignItems:"center",gap:"8px",padding:"10px 16px",background:"var(--primary)",color:"white",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:600,cursor:g?"not-allowed":"pointer",opacity:g?.6:1,transition:"opacity 0.2s"},children:[e.jsx(Z,{size:18,style:{animation:g?"spin 1s linear infinite":"none"}}),"チェック"]})]}),j.length>0&&e.jsxs("div",{style:{padding:"16px",background:"linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",borderRadius:"12px",marginBottom:"24px",border:"2px solid #fcd34d"},children:[e.jsxs("div",{style:{fontSize:"16px",fontWeight:700,color:"#92400e",marginBottom:"8px"},children:["🎉 ",j.length,"個の新しい称号を獲得しました！"]}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"8px"},children:j.map(t=>{const i=he(t);return i?e.jsx(Y,{title:i,size:"small",showName:!0},t):null})})]}),e.jsx("div",{style:{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"8px",marginBottom:"24px"},children:M.map(t=>e.jsxs("button",{onClick:()=>S(t.id),style:{padding:"8px 16px",background:p===t.id?"var(--primary)":"var(--card)",color:p===t.id?"white":"var(--text)",border:`1px solid ${p===t.id?"var(--primary)":"var(--border)"}`,borderRadius:"20px",fontSize:"14px",fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s"},children:[e.jsx("span",{style:{marginRight:"6px"},children:t.icon}),t.name]},t.id))}),k?e.jsxs("div",{style:{textAlign:"center",padding:"40px",color:"var(--text-secondary)"},children:[e.jsx("div",{style:{width:"40px",height:"40px",margin:"0 auto 12px",border:"3px solid var(--border)",borderTopColor:"var(--primary)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}),"読み込み中..."]}):e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:I.map(t=>{const i=h.has(t.id),d=B===t.id;return e.jsxs("div",{style:{padding:"16px",background:i?"var(--card)":"var(--background)",border:"2px solid var(--border)",borderRadius:"12px",opacity:i?1:.5},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(Y,{title:t,size:"medium",showName:!0}),d&&e.jsx("span",{style:{padding:"4px 8px",background:"var(--primary)",color:"white",borderRadius:"4px",fontSize:"12px",fontWeight:600},children:"装備中"})]}),i&&e.jsx("button",{onClick:()=>x(t.id),style:{padding:"8px 16px",background:d?"var(--primary)":"var(--background)",color:d?"white":"var(--text)",border:`1px solid ${d?"var(--primary)":"var(--border)"}`,borderRadius:"8px",fontSize:"14px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.2s"},children:d?e.jsxs(e.Fragment,{children:[e.jsx($,{size:18}),"装備中"]}):e.jsxs(e.Fragment,{children:[e.jsx(q,{size:18}),"装備"]})})]}),e.jsx("div",{style:{fontSize:"13px",color:"var(--text-secondary)",marginBottom:"8px"},children:t.description}),!i&&e.jsxs("div",{style:{padding:"8px",background:"rgba(0, 0, 0, 0.05)",borderRadius:"6px",fontSize:"12px",color:"var(--text-secondary)",display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx(fe,{size:14}),"未獲得"]})]},t.id)})})]})},De=({onBack:b})=>{const{user:a}=L(),f=ee(),u=re(),[k,m]=s.useState(null),[g,v]=s.useState(!0),[p,S]=s.useState(!1);s.useEffect(()=>{a&&j()},[a]);const j=async()=>{if(a){v(!0);try{const n=await Me(a.uid),y=await Ue(a.uid);n&&m({missions:n.missions,totalPoints:y})}catch(n){console.error("ミッションデータ取得エラー:",n)}finally{v(!1)}}},w=async()=>{if(a){S(!0);try{await Te(a.uid,{intakeCount:f.intakes.length,expenseCount:u.expenses.length}),await j()}catch(n){console.error("ミッション更新エラー:",n)}finally{S(!1)}}};if(g)return e.jsxs("div",{style:{padding:"40px",textAlign:"center",color:"var(--text-secondary)"},children:[e.jsx("div",{style:{width:"40px",height:"40px",margin:"0 auto 12px",border:"3px solid var(--border)",borderTopColor:"var(--primary)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}),"読み込み中..."]});const C=n=>k?.missions.find(y=>y.missionId===n);return e.jsxs("div",{style:{padding:"16px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[b&&e.jsx("button",{onClick:b,style:{background:"none",border:"none",cursor:"pointer",padding:"8px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"},onMouseEnter:n=>{n.currentTarget.style.background="var(--background)"},onMouseLeave:n=>{n.currentTarget.style.background="none"},children:e.jsx(P,{size:24,color:"var(--text)"})}),e.jsx("h2",{style:{fontSize:"24px",fontWeight:700,color:"var(--text)"},children:"デイリーミッション"})]}),e.jsxs("button",{onClick:w,disabled:p,style:{display:"flex",alignItems:"center",gap:"8px",padding:"8px 16px",borderRadius:"9999px",backgroundColor:"var(--primary)",color:"white",border:"none",cursor:"pointer",transition:"opacity 0.2s",opacity:p?.7:1},children:[p?e.jsx("div",{className:"spinner",style:{width:"16px",height:"16px",border:"2px solid white",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}):e.jsx(Z,{size:20}),"更新"]})]}),e.jsx("div",{style:{padding:"16px",background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",borderRadius:"12px",marginBottom:"24px",color:"white",display:"flex",alignItems:"center",justifyContent:"space-between"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(O,{size:32}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"14px",opacity:.9},children:"累計ポイント"}),e.jsx("div",{style:{fontSize:"28px",fontWeight:700},children:k?.totalPoints||0})]})]})}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:Be.map(n=>{const y=C(n.id),r=y?.current||0,o=y?.completed||!1,x=Math.min(r/n.target*100,100);return e.jsxs("div",{style:{padding:"16px",background:o?"var(--card)":"var(--background)",border:`2px solid ${o?"var(--primary)":"var(--border)"}`,borderRadius:"12px",opacity:o?1:.9},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx("span",{style:{fontSize:"24px"},children:n.icon}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"16px",fontWeight:600,color:"var(--text)"},children:n.name}),e.jsx("div",{style:{fontSize:"13px",color:"var(--text-secondary)"},children:n.description})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[o?e.jsx($,{size:24,color:"var(--primary)"}):e.jsx(q,{size:24,color:"var(--text-secondary)"}),e.jsxs("div",{style:{padding:"4px 12px",background:"var(--primary)",color:"white",borderRadius:"9999px",fontSize:"14px",fontWeight:600},children:["+",n.points,"P"]})]})]}),e.jsxs("div",{style:{marginTop:"8px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"4px",fontSize:"12px",color:"var(--text-secondary)"},children:[e.jsxs("span",{children:[r," / ",n.target]}),e.jsxs("span",{children:[Math.round(x),"%"]})]}),e.jsx("div",{style:{width:"100%",height:"8px",background:"var(--border)",borderRadius:"9999px",overflow:"hidden"},children:e.jsx("div",{style:{width:`${x}%`,height:"100%",background:o?"linear-gradient(90deg, var(--primary) 0%, #43a047 100%)":"linear-gradient(90deg, #667eea 0%, #764ba2 100%)",transition:"width 0.3s ease"}})})]})]},n.id)})})]})},$e=({onBack:b})=>{const{user:a}=L(),[f,u]=s.useState(null),[k,m]=s.useState(!0),[g,v]=s.useState("all");s.useEffect(()=>{a&&p()},[a]);const p=async()=>{if(a){m(!0);try{const r=await Ee(a.uid);u(r)}catch(r){console.error("装飾データ取得エラー:",r)}finally{m(!1)}}},S=async r=>{if(a)try{await Pe(a.uid,r)?(alert("装飾を購入しました！"),await p()):alert("ポイントが不足しています。")}catch(o){console.error("購入エラー:",o),alert("購入に失敗しました")}},j=async(r,o)=>{if(a)try{await We(a.uid,r,o),await p()}catch(x){console.error("装備エラー:",x),alert("装備に失敗しました")}};if(k)return e.jsxs("div",{style:{padding:"40px",textAlign:"center",color:"var(--text-secondary)"},children:[e.jsx("div",{style:{width:"40px",height:"40px",margin:"0 auto 12px",border:"3px solid var(--border)",borderTopColor:"var(--primary)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}),"読み込み中..."]});const w=g==="all"?H:H.filter(r=>r.type===g),C=r=>{switch(r){case"common":return"#9e9e9e";case"rare":return"#2196f3";case"epic":return"#9c27b0";case"legendary":return"#ffc107";default:return"#9e9e9e"}},n=r=>f?.ownedCosmetics.includes(r)||!1,y=(r,o)=>f?o==="frame"?f.equippedFrame===r:o==="nameColor"?f.equippedNameColor===r:o==="skin"?f.equippedSkin===r:!1:!1;return e.jsxs("div",{style:{padding:"16px"},children:[e.jsx("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[b&&e.jsx("button",{onClick:b,style:{background:"none",border:"none",cursor:"pointer",padding:"8px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"},onMouseEnter:r=>{r.currentTarget.style.background="var(--background)"},onMouseLeave:r=>{r.currentTarget.style.background="none"},children:e.jsx(P,{size:24,color:"var(--text)"})}),e.jsx("h2",{style:{fontSize:"24px",fontWeight:700,color:"var(--text)"},children:"装飾ショップ"})]})}),e.jsxs("div",{style:{padding:"16px",background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",borderRadius:"12px",marginBottom:"24px",color:"white",display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(O,{size:32}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"14px",opacity:.9},children:"現在のポイント"}),e.jsx("div",{style:{fontSize:"28px",fontWeight:700},children:f?.totalPoints||0})]})]}),e.jsx("div",{style:{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"8px",marginBottom:"24px"},children:[{id:"all",name:"すべて",icon:"📋"},{id:"frame",name:"フレーム",icon:"🖼️"},{id:"nameColor",name:"名前色",icon:"🎨"},{id:"skin",name:"スキン",icon:"✨"}].map(r=>e.jsxs("button",{onClick:()=>v(r.id),style:{padding:"8px 16px",background:g===r.id?"var(--primary)":"var(--card)",color:g===r.id?"white":"var(--text)",border:`1px solid ${g===r.id?"var(--primary)":"var(--border)"}`,borderRadius:"20px",fontSize:"14px",fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s"},children:[e.jsx("span",{style:{marginRight:"6px"},children:r.icon}),r.name]},r.id))}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:w.map(r=>{const o=n(r.id),x=y(r.id,r.type),h=(f?.totalPoints||0)>=r.price;return e.jsxs("div",{style:{padding:"16px",background:o?"var(--card)":"var(--background)",border:`2px solid ${x?"var(--primary)":"var(--border)"}`,borderRadius:"12px",opacity:o?1:.9},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx("span",{style:{fontSize:"24px"},children:r.icon}),e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{fontSize:"16px",fontWeight:600,color:"var(--text)"},children:r.name}),e.jsx("span",{style:{padding:"2px 8px",background:C(r.rarity),color:"white",borderRadius:"4px",fontSize:"11px",fontWeight:600},children:r.rarity})]}),e.jsx("div",{style:{fontSize:"13px",color:"var(--text-secondary)"},children:r.description})]})]}),x&&e.jsx("div",{style:{padding:"4px 8px",background:"var(--primary)",color:"white",borderRadius:"4px",fontSize:"12px",fontWeight:600},children:"装備中"})]}),r.type==="nameColor"&&r.data.color&&e.jsx("div",{style:{padding:"8px",background:r.data.color,borderRadius:"6px",marginBottom:"12px",textAlign:"center",color:"white",fontWeight:600},children:"名前の色プレビュー"}),r.type==="nameColor"&&r.data.gradient&&e.jsx("div",{style:{padding:"8px",background:r.data.gradient,borderRadius:"6px",marginBottom:"12px",textAlign:"center",color:"white",fontWeight:600},children:"名前の色プレビュー"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("div",{style:{padding:"6px 12px",background:"var(--background)",borderRadius:"6px",fontSize:"14px",fontWeight:600,color:h||o?"var(--text)":"#dc2626"},children:r.price===0?"無料":`${r.price}P`}),o?e.jsx("button",{onClick:()=>j(r.id,r.type),style:{padding:"8px 16px",background:x?"var(--primary)":"var(--background)",color:x?"white":"var(--text)",border:`1px solid ${x?"var(--primary)":"var(--border)"}`,borderRadius:"8px",fontSize:"14px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"},children:x?e.jsxs(e.Fragment,{children:[e.jsx($,{size:18}),"装備中"]}):e.jsxs(e.Fragment,{children:[e.jsx(q,{size:18}),"装備"]})}):e.jsxs("button",{onClick:()=>S(r.id),disabled:!h,style:{padding:"8px 16px",background:h?"var(--primary)":"var(--border)",color:h?"white":"var(--text-secondary)",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:600,cursor:h?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:"6px",opacity:h?1:.6},children:[e.jsx(ye,{size:18}),"購入"]})]})]},r.id)})})]})},Ve=()=>{const{settings:b,updateSettings:a,toggleDarkMode:f}=be(),{intakes:u}=ee(),{expenses:k}=re(),{stocks:m}=ve(),{user:g}=L(),[v,p]=s.useState((b.monthlyBudget??3e4).toString()),[S,j]=s.useState(!1),[w,C]=s.useState(!1),[n,y]=s.useState(!1),[r,o]=s.useState(!1),[x,h]=s.useState(!1),B=()=>{a({monthlyBudget:Number(v)}),alert("設定を保存しました！")},I=()=>{const i=["種類,名前,カロリー,金額,日付",...u.map(R=>`食事記録,${R.name},${R.calories},${R.price},${R.date}`)].join(`
`),d=new Blob([i],{type:"text/csv;charset=utf-8;"}),N=document.createElement("a");N.href=URL.createObjectURL(d),N.download=`健康家計アプリ_${new Date().toISOString().split("T")[0]}.csv`,N.click()},M=()=>{const i={intakes:u,expenses:k,stocks:m,settings:b,exportedAt:new Date().toISOString()},d=new Blob([JSON.stringify(i,null,2)],{type:"application/json"}),N=document.createElement("a");N.href=URL.createObjectURL(d),N.download=`健康家計アプリ_${new Date().toISOString().split("T")[0]}.json`,N.click()},t=async()=>{if(window.confirm("ログアウトしますか？")){const i=await Ie();i.error&&alert("ログアウトに失敗しました: "+i.error)}};return S?e.jsx(Le,{onBack:()=>j(!1)}):w?e.jsx(Ae,{onBack:()=>C(!1)}):n?e.jsx(je,{onBack:()=>y(!1)}):r?e.jsx(De,{onBack:()=>o(!1)}):x?e.jsx($e,{onBack:()=>h(!1)}):e.jsxs("section",{className:"screen active",children:[e.jsx("h2",{children:"設定"}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"プロフィール"}),e.jsxs("button",{className:"profile-edit-button",onClick:()=>j(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(D,{size:24,color:"var(--primary)"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"プロフィールを編集"})]}),e.jsx(T,{size:24,color:"var(--text-secondary)"})]}),e.jsxs("button",{onClick:()=>C(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(O,{size:24,color:"#f59e0b"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"称号"})]}),e.jsx(T,{size:24,color:"var(--text-secondary)"})]}),e.jsxs("button",{onClick:()=>y(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(we,{size:24,color:"#3b82f6"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"都道府県"})]}),e.jsx(T,{size:24,color:"var(--text-secondary)"})]}),e.jsx("p",{style:{fontSize:"0.9rem",color:"var(--text-secondary)",margin:"0"},children:"アイコン、名前、自己紹介などを編集"})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"ミッション・報酬"}),e.jsxs("button",{onClick:()=>o(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(ke,{size:24,color:"#667eea"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"デイリーミッション"})]}),e.jsx(T,{size:24,color:"var(--text-secondary)"})]}),e.jsxs("button",{onClick:()=>h(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(Se,{size:24,color:"#f59e0b"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"装飾ショップ"})]}),e.jsx(T,{size:24,color:"var(--text-secondary)"})]}),e.jsx("p",{style:{fontSize:"0.9rem",color:"var(--text-secondary)",margin:"0"},children:"ミッションをクリアしてポイントを獲得し、装飾を購入"})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"月間予算"}),e.jsx("input",{type:"number",value:v,onChange:i=>p(i.target.value),placeholder:"30000"}),e.jsxs("button",{className:"submit",onClick:B,children:[e.jsx(Q,{size:18,style:{marginRight:"8px"}}),"保存"]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"外観"}),e.jsxs("div",{className:"setting-item",children:[e.jsxs("div",{className:"setting-item-left",children:[e.jsx("div",{className:"setting-icon",children:e.jsx(Ce,{size:24})}),e.jsx("span",{className:"setting-label",children:"ダークモード"})]}),e.jsxs("label",{className:"toggle-switch",children:[e.jsx("input",{type:"checkbox",checked:b.darkMode,onChange:f}),e.jsx("span",{className:"toggle-slider"})]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"データエクスポート"}),e.jsxs("div",{style:{display:"flex",gap:"8px"},children:[e.jsxs("button",{className:"submit",onClick:I,style:{flex:1},children:[e.jsx(ze,{size:18,style:{marginRight:"8px"}}),"CSV"]}),e.jsxs("button",{className:"submit",onClick:M,style:{flex:1},children:[e.jsx(Ne,{size:18,style:{marginRight:"8px"}}),"JSON"]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"データ統計"}),e.jsxs("div",{style:{fontSize:"0.9rem",color:"var(--text-secondary, #666)"},children:[e.jsxs("p",{children:["食事記録: ",u.length,"件"]}),e.jsxs("p",{children:["支出記録: ",k.length,"件"]}),e.jsxs("p",{children:["在庫アイテム: ",m.length,"件"]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"アカウント"}),e.jsx("div",{style:{fontSize:"0.9rem",color:"var(--text-secondary, #666)",marginBottom:"12px"},children:e.jsxs("p",{children:["ログイン: ",g?.email]})}),e.jsxs("button",{className:"submit",onClick:t,style:{background:"linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",width:"100%"},children:[e.jsx(Re,{size:18,style:{marginRight:"8px"}}),"ログアウト"]})]})]})};export{Ve as SettingsScreen};
