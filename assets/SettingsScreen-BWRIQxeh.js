import{r as s,j as e}from"./ui-vendor-JVI_EMCz.js";import{V as P,e as ee,W,X as re,q as Y,Y as q,Z as pe,_ as xe,b as ue,d as ge,$ as fe,a0 as he,a1 as me,a2 as Z,a3 as ye,a4 as be,u as D,a5 as E,a6 as H,a7 as K,a8 as te,a9 as ve,aa as Q,J as L,ab as A,ac as je,ad as ke,n as ae,o as se,x as O,k as F,v as we,ae as Se,A as Ce,af as ze,ag as T,ah as Re,ai as Ne,aj as Me,ak as Ie,al as Ue,am as Be,an as Te,ao as Pe}from"./index-hlwsRtvf.js";import{g as Ee,a as We,d as De,c as _e,s as qe}from"./mission-BYof5vFd.js";import{d as G,g as ie,u as ne,s as $e}from"./firebase-vendor-CyvWsNSE.js";import"./react-vendor-Bzgz95E1.js";const Le=({onBack:c})=>{const[a,o]=s.useState(null),[i,j]=s.useState(""),[p,g]=s.useState(""),[h,m]=s.useState(""),[S,k]=s.useState(""),[w,C]=s.useState(!0),[n,v]=s.useState(""),[r,l]=s.useState(""),[y,b]=s.useState(!1),[B,M]=s.useState(!1),[I,t]=s.useState(!1),[d,u]=s.useState(""),[R,N]=s.useState(""),V=s.useRef(null),X=s.useRef(null);s.useEffect(()=>{oe()},[]);const oe=async()=>{try{const x=P.currentUser;if(!x)return;const f=await ee(x.uid);f&&(o(f),j(f.displayName),g(f.username),m(f.bio||""),k(f.websiteUrl||""),C(f.isPublic),v(f.avatarUrl||""),l(f.coverUrl||""))}catch(x){console.error("Load profile error:",x),u("プロフィールの読み込みに失敗しました")}},de=async x=>{const f=x.target.files?.[0];if(!f)return;const U=Z(f);if(!U.valid){u(U.error||"");return}M(!0),u("");try{const z=P.currentUser;if(!z)throw new Error("ログインが必要です");const _=await be(z.uid,f);v(_),N("アイコン画像をアップロードしました")}catch(z){console.error("Avatar upload error:",z),u(z.message||"アイコン画像のアップロードに失敗しました")}finally{M(!1)}},le=async x=>{const f=x.target.files?.[0];if(!f)return;const U=Z(f);if(!U.valid){u(U.error||"");return}t(!0),u("");try{const z=P.currentUser;if(!z)throw new Error("ログインが必要です");const _=await ye(z.uid,f);l(_),N("カバー画像をアップロードしました")}catch(z){console.error("Cover upload error:",z),u(z.message||"カバー画像のアップロードに失敗しました")}finally{t(!1)}},ce=async()=>{u(""),N(""),b(!0);try{const x=P.currentUser;if(!x)throw new Error("ログインが必要です");if(!i.trim()){u("表示名を入力してください"),b(!1);return}const f=fe(p);if(!f.valid){u(f.error||""),b(!1);return}if(p!==a?.username&&!await he(p,x.uid)){u("このユーザー名は既に使用されています"),b(!1);return}await me(x.uid,{displayName:i.trim(),username:p,bio:h.trim(),websiteUrl:S.trim(),isPublic:w,avatarUrl:n,coverUrl:r}),N("プロフィールを更新しました！"),setTimeout(()=>N(""),3e3)}catch(x){console.error("Save profile error:",x),u(x.message||"プロフィールの更新に失敗しました")}finally{b(!1)}};return e.jsxs("div",{className:"profile-edit-screen",children:[e.jsxs("div",{className:"profile-edit-header",children:[e.jsxs("button",{onClick:c,className:"back-button",children:[e.jsx(W,{})," 戻る"]}),e.jsx("h2",{children:"プロフィール編集"}),e.jsxs("button",{onClick:ce,className:"save-button",disabled:y,children:[e.jsx(re,{})," ",y?"保存中...":"保存"]})]}),d&&e.jsx("div",{className:"error-message",children:d}),R&&e.jsx("div",{className:"success-message",children:R}),e.jsx("div",{className:"cover-section",children:e.jsxs("div",{className:"cover-image",style:{backgroundImage:r?`url(${r})`:"linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"},children:[e.jsxs("button",{onClick:()=>X.current?.click(),className:"cover-upload-button",disabled:I,children:[e.jsx(Y,{})," ",I?"アップロード中...":"カバー画像を変更"]}),e.jsx("input",{ref:X,type:"file",accept:"image/*",onChange:le,style:{display:"none"}})]})}),e.jsx("div",{className:"avatar-section",children:e.jsxs("div",{className:"avatar-image",children:[n?e.jsx("img",{src:n,alt:"Avatar"}):e.jsx("div",{className:"avatar-placeholder",children:e.jsx(q,{size:60})}),e.jsx("button",{onClick:()=>V.current?.click(),className:"avatar-upload-button",disabled:B,children:e.jsx(Y,{})}),e.jsx("input",{ref:V,type:"file",accept:"image/*",onChange:de,style:{display:"none"}})]})}),e.jsxs("div",{className:"profile-form",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(q,{})," 表示名"]}),e.jsx("input",{type:"text",value:i,onChange:x=>j(x.target.value),placeholder:"山田太郎",maxLength:50}),e.jsxs("span",{className:"char-count",children:[i.length,"/50"]})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(pe,{})," ユーザー名"]}),e.jsxs("div",{className:"username-input",children:[e.jsx("span",{className:"username-prefix",children:"@"}),e.jsx("input",{type:"text",value:p,onChange:x=>g(x.target.value.toLowerCase()),placeholder:"yamada_taro",maxLength:20})]}),e.jsx("span",{className:"hint",children:"英数字とアンダースコア（_）のみ使用可能"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"自己紹介"}),e.jsx("textarea",{value:h,onChange:x=>m(x.target.value),placeholder:"あなたについて教えてください...",maxLength:200,rows:4}),e.jsxs("span",{className:"char-count",children:[h.length,"/200"]})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{children:[e.jsx(xe,{})," WebサイトURL"]}),e.jsx("input",{type:"url",value:S,onChange:x=>k(x.target.value),placeholder:"https://example.com"})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("label",{className:"toggle-label",children:[w?e.jsx(ue,{}):e.jsx(ge,{}),"プロフィールを公開する",e.jsx("input",{type:"checkbox",checked:w,onChange:x=>C(x.target.checked),className:"toggle-switch"})]}),e.jsx("span",{className:"hint",children:w?"誰でもあなたのプロフィールを閲覧できます":"フォロワーのみプロフィールを閲覧できます"})]})]}),e.jsx("style",{children:`
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
      `})]})},Ae=({onBack:c})=>{const{user:a}=D(),[o,i]=s.useState([]),[j,p]=s.useState(!0),[g,h]=s.useState(!1),[m,S]=s.useState("all"),[k,w]=s.useState([]),[C,n]=s.useState(void 0);s.useEffect(()=>{a&&(r(),v())},[a]);const v=async()=>{if(a)try{const t=await ee(a.uid);n(t?.prefecture)}catch(t){console.error("プロフィール取得エラー:",t)}},r=async()=>{if(a){p(!0);try{const t=await E(a.uid);i(t);const d=await H(a.uid);if(d.length>0){w(d);const u=await E(a.uid);i(u)}}catch(t){console.error("称号取得エラー:",t)}finally{p(!1)}}},l=async()=>{if(a){h(!0);try{const t=await H(a.uid);t.length>0?(w(t),alert(`🎉 ${t.length}個の新しい称号を獲得しました！`)):alert("新しい称号はありません");const d=await E(a.uid);i(d)}catch(t){console.error("称号チェックエラー:",t),alert("称号チェックに失敗しました")}finally{h(!1)}}},y=async t=>{if(a)try{await ke(a.uid,t);const d=await E(a.uid);i(d)}catch(d){console.error("称号装備エラー:",d),alert("称号の装備に失敗しました")}},b=new Set(o.map(t=>t.titleId)),B=o.find(t=>t.isEquipped)?.titleId,M=(m==="all"?K:K.filter(t=>t.category===m)).filter(t=>t.condition.prefectureCode?t.condition.prefectureCode===C:!0),I=[{id:"all",name:"すべて",icon:"📋"},{id:"beginner",name:"初心者",icon:"🎉"},{id:"poster",name:"投稿者",icon:"📝"},{id:"social",name:"ソーシャル",icon:"⭐"},{id:"recipe",name:"レシピ",icon:"🍳"},{id:"achievement",name:"アチーブメント",icon:"🏆"},{id:"prefecture",name:"都道府県",icon:"🗾"},{id:"special",name:"特別",icon:"👑"}];return e.jsxs("div",{style:{padding:"16px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[c&&e.jsx("button",{onClick:c,style:{background:"none",border:"none",cursor:"pointer",padding:"8px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"},onMouseEnter:t=>{t.currentTarget.style.background="var(--background)"},onMouseLeave:t=>{t.currentTarget.style.background="none"},children:e.jsx(W,{size:24,color:"var(--text)"})}),e.jsx("h2",{style:{fontSize:"24px",fontWeight:700,color:"var(--text)"},children:"称号"})]}),e.jsxs("button",{onClick:l,disabled:g,style:{display:"flex",alignItems:"center",gap:"8px",padding:"10px 16px",background:"var(--primary)",color:"white",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:600,cursor:g?"not-allowed":"pointer",opacity:g?.6:1,transition:"opacity 0.2s"},children:[e.jsx(te,{size:18,style:{animation:g?"spin 1s linear infinite":"none"}}),"チェック"]})]}),k.length>0&&e.jsxs("div",{style:{padding:"16px",background:"linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",borderRadius:"12px",marginBottom:"24px",border:"2px solid #fcd34d"},children:[e.jsxs("div",{style:{fontSize:"16px",fontWeight:700,color:"#92400e",marginBottom:"8px"},children:["🎉 ",k.length,"個の新しい称号を獲得しました！"]}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"8px"},children:k.map(t=>{const d=ve(t);return d?e.jsx(Q,{title:d,size:"small",showName:!0},t):null})})]}),e.jsx("div",{style:{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"8px",marginBottom:"24px"},children:I.map(t=>e.jsxs("button",{onClick:()=>S(t.id),style:{padding:"8px 16px",background:m===t.id?"var(--primary)":"var(--card)",color:m===t.id?"white":"var(--text)",border:`1px solid ${m===t.id?"var(--primary)":"var(--border)"}`,borderRadius:"20px",fontSize:"14px",fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s"},children:[e.jsx("span",{style:{marginRight:"6px"},children:t.icon}),t.name]},t.id))}),j?e.jsxs("div",{style:{textAlign:"center",padding:"40px",color:"var(--text-secondary)"},children:[e.jsx("div",{style:{width:"40px",height:"40px",margin:"0 auto 12px",border:"3px solid var(--border)",borderTopColor:"var(--primary)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}),"読み込み中..."]}):e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:M.map(t=>{const d=b.has(t.id),u=B===t.id;return e.jsxs("div",{style:{padding:"16px",background:d?"var(--card)":"var(--background)",border:"2px solid var(--border)",borderRadius:"12px",opacity:d?1:.5},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(Q,{title:t,size:"medium",showName:!0}),u&&e.jsx("span",{style:{padding:"4px 8px",background:"var(--primary)",color:"white",borderRadius:"4px",fontSize:"12px",fontWeight:600},children:"装備中"})]}),d&&e.jsx("button",{onClick:()=>y(t.id),style:{padding:"8px 16px",background:u?"var(--primary)":"var(--background)",color:u?"white":"var(--text)",border:`1px solid ${u?"var(--primary)":"var(--border)"}`,borderRadius:"8px",fontSize:"14px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.2s"},children:u?e.jsxs(e.Fragment,{children:[e.jsx(L,{size:18}),"装備中"]}):e.jsxs(e.Fragment,{children:[e.jsx(A,{size:18}),"装備"]})})]}),e.jsx("div",{style:{fontSize:"13px",color:"var(--text-secondary)",marginBottom:"8px"},children:t.description}),!d&&e.jsxs("div",{style:{padding:"8px",background:"rgba(0, 0, 0, 0.05)",borderRadius:"6px",fontSize:"12px",color:"var(--text-secondary)",display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx(je,{size:14}),"未獲得"]})]},t.id)})})]})},Oe=({onBack:c})=>{const{user:a}=D(),o=ae(),i=se(),[j,p]=s.useState(null),[g,h]=s.useState(!0),[m,S]=s.useState(!1);s.useEffect(()=>{a&&k()},[a]);const k=async()=>{if(a){h(!0);try{const n=await Ee(a.uid),v=await We(a.uid);n&&p({missions:n.missions,totalPoints:v})}catch(n){console.error("ミッションデータ取得エラー:",n)}finally{h(!1)}}},w=async()=>{if(a){S(!0);try{await _e(a.uid,{intakeCount:o.intakes.length,expenseCount:i.expenses.length}),await k()}catch(n){console.error("ミッション更新エラー:",n)}finally{S(!1)}}};if(g)return e.jsxs("div",{style:{padding:"40px",textAlign:"center",color:"var(--text-secondary)"},children:[e.jsx("div",{style:{width:"40px",height:"40px",margin:"0 auto 12px",border:"3px solid var(--border)",borderTopColor:"var(--primary)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}),"読み込み中..."]});const C=n=>j?.missions.find(v=>v.missionId===n);return e.jsxs("div",{style:{padding:"16px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[c&&e.jsx("button",{onClick:c,style:{background:"none",border:"none",cursor:"pointer",padding:"8px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"},onMouseEnter:n=>{n.currentTarget.style.background="var(--background)"},onMouseLeave:n=>{n.currentTarget.style.background="none"},children:e.jsx(W,{size:24,color:"var(--text)"})}),e.jsx("h2",{style:{fontSize:"24px",fontWeight:700,color:"var(--text)"},children:"デイリーミッション"})]}),e.jsxs("button",{onClick:w,disabled:m,style:{display:"flex",alignItems:"center",gap:"8px",padding:"8px 16px",borderRadius:"9999px",backgroundColor:"var(--primary)",color:"white",border:"none",cursor:"pointer",transition:"opacity 0.2s",opacity:m?.7:1},children:[m?e.jsx("div",{className:"spinner",style:{width:"16px",height:"16px",border:"2px solid white",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}):e.jsx(te,{size:20}),"更新"]})]}),e.jsx("div",{style:{padding:"16px",background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",borderRadius:"12px",marginBottom:"24px",color:"white",display:"flex",alignItems:"center",justifyContent:"space-between"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(O,{size:32}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"14px",opacity:.9},children:"累計ポイント"}),e.jsx("div",{style:{fontSize:"28px",fontWeight:700},children:j?.totalPoints||0})]})]})}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:De.map(n=>{const v=C(n.id),r=v?.current||0,l=v?.completed||!1,y=Math.min(r/n.target*100,100);return e.jsxs("div",{style:{padding:"16px",background:l?"var(--card)":"var(--background)",border:`2px solid ${l?"var(--primary)":"var(--border)"}`,borderRadius:"12px",opacity:l?1:.9},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx("span",{style:{fontSize:"24px"},children:n.icon}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"16px",fontWeight:600,color:"var(--text)"},children:n.name}),e.jsx("div",{style:{fontSize:"13px",color:"var(--text-secondary)"},children:n.description})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[l?e.jsx(L,{size:24,color:"var(--primary)"}):e.jsx(A,{size:24,color:"var(--text-secondary)"}),e.jsxs("div",{style:{padding:"4px 12px",background:"var(--primary)",color:"white",borderRadius:"9999px",fontSize:"14px",fontWeight:600},children:["+",n.points,"P"]})]})]}),e.jsxs("div",{style:{marginTop:"8px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"4px",fontSize:"12px",color:"var(--text-secondary)"},children:[e.jsxs("span",{children:[r," / ",n.target]}),e.jsxs("span",{children:[Math.round(y),"%"]})]}),e.jsx("div",{style:{width:"100%",height:"8px",background:"var(--border)",borderRadius:"9999px",overflow:"hidden"},children:e.jsx("div",{style:{width:`${y}%`,height:"100%",background:l?"linear-gradient(90deg, var(--primary) 0%, #43a047 100%)":"linear-gradient(90deg, #667eea 0%, #764ba2 100%)",transition:"width 0.3s ease"}})})]})]},n.id)})})]})},$=[{id:"frame_default",name:"デフォルトフレーム",description:"基本的なフレーム",type:"frame",icon:"🖼️",price:0,rarity:"common",data:{frameStyle:{border:"2px solid var(--border)",borderRadius:"8px"}}},{id:"frame_gold",name:"黄金のフレーム",description:"輝く黄金のフレーム",type:"frame",icon:"✨",price:500,rarity:"rare",data:{frameStyle:{border:"3px solid #ffd700",borderRadius:"12px",boxShadow:"0 0 10px rgba(255, 215, 0, 0.5)"}}},{id:"frame_platinum",name:"プラチナフレーム",description:"高貴なプラチナのフレーム",type:"frame",icon:"💎",price:1e3,rarity:"epic",data:{frameStyle:{border:"4px solid #e5e4e2",borderRadius:"16px",boxShadow:"0 0 15px rgba(229, 228, 226, 0.7)"}}},{id:"frame_legendary",name:"伝説のフレーム",description:"伝説級の輝きを持つフレーム",type:"frame",icon:"👑",price:2e3,rarity:"legendary",data:{frameStyle:{border:"5px solid #ff6b6b",borderRadius:"20px",boxShadow:"0 0 20px rgba(255, 107, 107, 0.8)",background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}},{id:"namecolor_default",name:"デフォルト色",description:"標準の名前色",type:"nameColor",icon:"🎨",price:0,rarity:"common",data:{color:"var(--text)"}},{id:"namecolor_red",name:"深紅の名前",description:"深紅に染まる名前",type:"nameColor",icon:"🔴",price:200,rarity:"common",data:{color:"#dc2626"}},{id:"namecolor_blue",name:"蒼穹の名前",description:"蒼い空のような名前",type:"nameColor",icon:"🔵",price:200,rarity:"common",data:{color:"#2563eb"}},{id:"namecolor_gold",name:"黄金の名前",description:"黄金に輝く名前",type:"nameColor",icon:"⭐",price:500,rarity:"rare",data:{gradient:"linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"}},{id:"namecolor_rainbow",name:"虹色の名前",description:"虹のように美しい名前",type:"nameColor",icon:"🌈",price:1e3,rarity:"epic",data:{gradient:"linear-gradient(90deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 57%, #4b0082 71%, #9400d3 100%)"}},{id:"namecolor_legendary",name:"伝説の名前色",description:"伝説級の輝きを持つ名前",type:"nameColor",icon:"💫",price:2e3,rarity:"legendary",data:{gradient:"linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"}},{id:"skin_default",name:"デフォルトスキン",description:"標準のスキン",type:"skin",icon:"🎨",price:0,rarity:"common",data:{skinConfig:{theme:"light"}}},{id:"skin_dark",name:"闇のスキン",description:"深い闇に包まれたスキン",type:"skin",icon:"🌑",price:300,rarity:"common",data:{skinConfig:{primaryColor:"#1a1a1a",secondaryColor:"#2d2d2d",theme:"dark"}}},{id:"skin_sakura",name:"桜のスキン",description:"桜色に染まるスキン",type:"skin",icon:"🌸",price:500,rarity:"rare",data:{skinConfig:{primaryColor:"#ffb3d9",secondaryColor:"#ff99cc",theme:"custom"}}},{id:"skin_ocean",name:"海のスキン",description:"海のように広がるスキン",type:"skin",icon:"🌊",price:500,rarity:"rare",data:{skinConfig:{primaryColor:"#4fc3f7",secondaryColor:"#29b6f6",theme:"custom"}}},{id:"skin_sunset",name:"夕焼けのスキン",description:"夕焼けに染まるスキン",type:"skin",icon:"🌅",price:800,rarity:"epic",data:{skinConfig:{primaryColor:"#ff6b6b",secondaryColor:"#ffa726",theme:"custom"}}},{id:"skin_legendary",name:"伝説のスキン",description:"伝説級の輝きを持つスキン",type:"skin",icon:"✨",price:2e3,rarity:"legendary",data:{skinConfig:{primaryColor:"#667eea",secondaryColor:"#764ba2",theme:"custom",backgroundImage:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}}],J=async c=>{try{const a=G(F,`users/${c}/cosmetics`,"data"),o=await ie(a);if(o.exists()){const i=o.data();return{userId:c,ownedCosmetics:i.ownedCosmetics||[],equippedFrame:i.equippedFrame,equippedNameColor:i.equippedNameColor,equippedSkin:i.equippedSkin,totalPoints:i.totalPoints||0}}return{userId:c,ownedCosmetics:["frame_default","namecolor_default","skin_default"],equippedFrame:"frame_default",equippedNameColor:"namecolor_default",equippedSkin:"skin_default",totalPoints:0}}catch(a){return console.error("装飾データ取得エラー:",a),null}},Fe=async(c,a)=>{try{const o=$.find(h=>h.id===a);if(!o)return!1;const i=await J(c);if(!i||i.ownedCosmetics.includes(a)||!await qe(c,o.price))return!1;const p=G(F,`users/${c}/cosmetics`,"data"),g=await ie(p);if(g.exists()){const h=g.data().ownedCosmetics||[];await ne(p,{ownedCosmetics:[...h,a]})}else await $e(p,{ownedCosmetics:[a],totalPoints:0});return console.log(`✅ 装飾「${o.name}」を購入しました`),!0}catch(o){return console.error("装飾購入エラー:",o),!1}},Ge=async(c,a,o)=>{try{const i=await J(c);if(!i)return;if(!i.ownedCosmetics.includes(a))throw new Error("この装飾を所有していません");const j=G(F,`users/${c}/cosmetics`,"data"),p={};o==="frame"?p.equippedFrame=a:o==="nameColor"?p.equippedNameColor=a:o==="skin"&&(p.equippedSkin=a),await ne(j,p),console.log(`✅ 装飾「${a}」を装備しました`)}catch(i){throw console.error("装飾装備エラー:",i),i}},Je=({onBack:c})=>{const{user:a}=D(),[o,i]=s.useState(null),[j,p]=s.useState(!0),[g,h]=s.useState("all");s.useEffect(()=>{a&&m()},[a]);const m=async()=>{if(a){p(!0);try{const r=await J(a.uid);i(r)}catch(r){console.error("装飾データ取得エラー:",r)}finally{p(!1)}}},S=async r=>{if(a)try{await Fe(a.uid,r)?(alert("装飾を購入しました！"),await m()):alert("ポイントが不足しています。")}catch(l){console.error("購入エラー:",l),alert("購入に失敗しました")}},k=async(r,l)=>{if(a)try{await Ge(a.uid,r,l),await m()}catch(y){console.error("装備エラー:",y),alert("装備に失敗しました")}};if(j)return e.jsxs("div",{style:{padding:"40px",textAlign:"center",color:"var(--text-secondary)"},children:[e.jsx("div",{style:{width:"40px",height:"40px",margin:"0 auto 12px",border:"3px solid var(--border)",borderTopColor:"var(--primary)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}),"読み込み中..."]});const w=g==="all"?$:$.filter(r=>r.type===g),C=r=>{switch(r){case"common":return"#9e9e9e";case"rare":return"#2196f3";case"epic":return"#9c27b0";case"legendary":return"#ffc107";default:return"#9e9e9e"}},n=r=>o?.ownedCosmetics.includes(r)||!1,v=(r,l)=>o?l==="frame"?o.equippedFrame===r:l==="nameColor"?o.equippedNameColor===r:l==="skin"?o.equippedSkin===r:!1:!1;return e.jsxs("div",{style:{padding:"16px"},children:[e.jsx("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[c&&e.jsx("button",{onClick:c,style:{background:"none",border:"none",cursor:"pointer",padding:"8px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"},onMouseEnter:r=>{r.currentTarget.style.background="var(--background)"},onMouseLeave:r=>{r.currentTarget.style.background="none"},children:e.jsx(W,{size:24,color:"var(--text)"})}),e.jsx("h2",{style:{fontSize:"24px",fontWeight:700,color:"var(--text)"},children:"装飾ショップ"})]})}),e.jsxs("div",{style:{padding:"16px",background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",borderRadius:"12px",marginBottom:"24px",color:"white",display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(O,{size:32}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"14px",opacity:.9},children:"現在のポイント"}),e.jsx("div",{style:{fontSize:"28px",fontWeight:700},children:o?.totalPoints||0})]})]}),e.jsx("div",{style:{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"8px",marginBottom:"24px"},children:[{id:"all",name:"すべて",icon:"📋"},{id:"frame",name:"フレーム",icon:"🖼️"},{id:"nameColor",name:"名前色",icon:"🎨"},{id:"skin",name:"スキン",icon:"✨"}].map(r=>e.jsxs("button",{onClick:()=>h(r.id),style:{padding:"8px 16px",background:g===r.id?"var(--primary)":"var(--card)",color:g===r.id?"white":"var(--text)",border:`1px solid ${g===r.id?"var(--primary)":"var(--border)"}`,borderRadius:"20px",fontSize:"14px",fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s"},children:[e.jsx("span",{style:{marginRight:"6px"},children:r.icon}),r.name]},r.id))}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:w.map(r=>{const l=n(r.id),y=v(r.id,r.type),b=(o?.totalPoints||0)>=r.price;return e.jsxs("div",{style:{padding:"16px",background:l?"var(--card)":"var(--background)",border:`2px solid ${y?"var(--primary)":"var(--border)"}`,borderRadius:"12px",opacity:l?1:.9},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx("span",{style:{fontSize:"24px"},children:r.icon}),e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[e.jsx("div",{style:{fontSize:"16px",fontWeight:600,color:"var(--text)"},children:r.name}),e.jsx("span",{style:{padding:"2px 8px",background:C(r.rarity),color:"white",borderRadius:"4px",fontSize:"11px",fontWeight:600},children:r.rarity})]}),e.jsx("div",{style:{fontSize:"13px",color:"var(--text-secondary)"},children:r.description})]})]}),y&&e.jsx("div",{style:{padding:"4px 8px",background:"var(--primary)",color:"white",borderRadius:"4px",fontSize:"12px",fontWeight:600},children:"装備中"})]}),r.type==="nameColor"&&r.data.color&&e.jsx("div",{style:{padding:"8px",background:r.data.color,borderRadius:"6px",marginBottom:"12px",textAlign:"center",color:"white",fontWeight:600},children:"名前の色プレビュー"}),r.type==="nameColor"&&r.data.gradient&&e.jsx("div",{style:{padding:"8px",background:r.data.gradient,borderRadius:"6px",marginBottom:"12px",textAlign:"center",color:"white",fontWeight:600},children:"名前の色プレビュー"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("div",{style:{padding:"6px 12px",background:"var(--background)",borderRadius:"6px",fontSize:"14px",fontWeight:600,color:b||l?"var(--text)":"#dc2626"},children:r.price===0?"無料":`${r.price}P`}),l?e.jsx("button",{onClick:()=>k(r.id,r.type),style:{padding:"8px 16px",background:y?"var(--primary)":"var(--background)",color:y?"white":"var(--text)",border:`1px solid ${y?"var(--primary)":"var(--border)"}`,borderRadius:"8px",fontSize:"14px",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"},children:y?e.jsxs(e.Fragment,{children:[e.jsx(L,{size:18}),"装備中"]}):e.jsxs(e.Fragment,{children:[e.jsx(A,{size:18}),"装備"]})}):e.jsxs("button",{onClick:()=>S(r.id),disabled:!b,style:{padding:"8px 16px",background:b?"var(--primary)":"var(--border)",color:b?"white":"var(--text-secondary)",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:600,cursor:b?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:"6px",opacity:b?1:.6},children:[e.jsx(we,{size:18}),"購入"]})]})]},r.id)})})]})},Ke=()=>{const{settings:c,updateSettings:a,toggleDarkMode:o}=Se(),{intakes:i}=ae(),{expenses:j}=se(),{stocks:p}=Ce(),{user:g}=D(),[h,m]=s.useState((c.monthlyBudget??3e4).toString()),[S,k]=s.useState(!1),[w,C]=s.useState(!1),[n,v]=s.useState(!1),[r,l]=s.useState(!1),[y,b]=s.useState(!1),B=()=>{a({monthlyBudget:Number(h)}),alert("設定を保存しました！")},M=()=>{const d=["種類,名前,カロリー,金額,日付",...i.map(N=>`食事記録,${N.name},${N.calories},${N.price},${N.date}`)].join(`
`),u=new Blob([d],{type:"text/csv;charset=utf-8;"}),R=document.createElement("a");R.href=URL.createObjectURL(u),R.download=`健康家計アプリ_${new Date().toISOString().split("T")[0]}.csv`,R.click()},I=()=>{const d={intakes:i,expenses:j,stocks:p,settings:c,exportedAt:new Date().toISOString()},u=new Blob([JSON.stringify(d,null,2)],{type:"application/json"}),R=document.createElement("a");R.href=URL.createObjectURL(u),R.download=`健康家計アプリ_${new Date().toISOString().split("T")[0]}.json`,R.click()},t=async()=>{if(window.confirm("ログアウトしますか？")){const d=await Pe();d.error&&alert("ログアウトに失敗しました: "+d.error)}};return S?e.jsx(Le,{onBack:()=>k(!1)}):w?e.jsx(Ae,{onBack:()=>C(!1)}):n?e.jsx(ze,{onBack:()=>v(!1)}):r?e.jsx(Oe,{onBack:()=>l(!1)}):y?e.jsx(Je,{onBack:()=>b(!1)}):e.jsxs("section",{className:"screen active",children:[e.jsx("h2",{children:"設定"}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"プロフィール"}),e.jsxs("button",{className:"profile-edit-button",onClick:()=>k(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(q,{size:24,color:"var(--primary)"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"プロフィールを編集"})]}),e.jsx(T,{size:24,color:"var(--text-secondary)"})]}),e.jsxs("button",{onClick:()=>C(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(O,{size:24,color:"#f59e0b"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"称号"})]}),e.jsx(T,{size:24,color:"var(--text-secondary)"})]}),e.jsxs("button",{onClick:()=>v(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(Re,{size:24,color:"#3b82f6"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"都道府県"})]}),e.jsx(T,{size:24,color:"var(--text-secondary)"})]}),e.jsx("p",{style:{fontSize:"0.9rem",color:"var(--text-secondary)",margin:"0"},children:"アイコン、名前、自己紹介などを編集"})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"ミッション・報酬"}),e.jsxs("button",{onClick:()=>l(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(Ne,{size:24,color:"#667eea"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"デイリーミッション"})]}),e.jsx(T,{size:24,color:"var(--text-secondary)"})]}),e.jsxs("button",{onClick:()=>b(!0),style:{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",background:"var(--background)",border:"2px solid var(--border)",borderRadius:"8px",cursor:"pointer",transition:"all 0.3s",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[e.jsx(Me,{size:24,color:"#f59e0b"}),e.jsx("span",{style:{color:"var(--text)",fontSize:"16px",fontWeight:"500"},children:"装飾ショップ"})]}),e.jsx(T,{size:24,color:"var(--text-secondary)"})]}),e.jsx("p",{style:{fontSize:"0.9rem",color:"var(--text-secondary)",margin:"0"},children:"ミッションをクリアしてポイントを獲得し、装飾を購入"})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"月間予算"}),e.jsx("input",{type:"number",value:h,onChange:d=>m(d.target.value),placeholder:"30000"}),e.jsxs("button",{className:"submit",onClick:B,children:[e.jsx(re,{size:18,style:{marginRight:"8px"}}),"保存"]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"外観"}),e.jsxs("div",{className:"setting-item",children:[e.jsxs("div",{className:"setting-item-left",children:[e.jsx("div",{className:"setting-icon",children:e.jsx(Ie,{size:24})}),e.jsx("span",{className:"setting-label",children:"ダークモード"})]}),e.jsxs("label",{className:"toggle-switch",children:[e.jsx("input",{type:"checkbox",checked:c.darkMode,onChange:o}),e.jsx("span",{className:"toggle-slider"})]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"データエクスポート"}),e.jsxs("div",{style:{display:"flex",gap:"8px"},children:[e.jsxs("button",{className:"submit",onClick:M,style:{flex:1},children:[e.jsx(Ue,{size:18,style:{marginRight:"8px"}}),"CSV"]}),e.jsxs("button",{className:"submit",onClick:I,style:{flex:1},children:[e.jsx(Be,{size:18,style:{marginRight:"8px"}}),"JSON"]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"データ統計"}),e.jsxs("div",{style:{fontSize:"0.9rem",color:"var(--text-secondary, #666)"},children:[e.jsxs("p",{children:["食事記録: ",i.length,"件"]}),e.jsxs("p",{children:["支出記録: ",j.length,"件"]}),e.jsxs("p",{children:["在庫アイテム: ",p.length,"件"]})]})]}),e.jsxs("div",{className:"card",children:[e.jsx("h3",{children:"アカウント"}),e.jsx("div",{style:{fontSize:"0.9rem",color:"var(--text-secondary, #666)",marginBottom:"12px"},children:e.jsxs("p",{children:["ログイン: ",g?.email]})}),e.jsxs("button",{className:"submit",onClick:t,style:{background:"linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",width:"100%"},children:[e.jsx(Te,{size:18,style:{marginRight:"8px"}}),"ログアウト"]})]})]})};export{Ke as SettingsScreen};
