// ========================================================
// Phuket Real Estate & Luxury Villa AI - Cloudflare Worker
// (ระบบ Live Group Alert + Broadcast + รองรับรูปภาพวิลล่า)
// ========================================================

export default {
  async fetch(request, env) {
    // 🔑 1. Token และ Key ของบอทอสังหาริมทรัพย์
    const BOT_TOKEN = "8908631910:AAEcNsl2yeieiqEBkBCXVGOA8RSW7cXn5uo";
    const DIFY_KEY = "app-VfCGzt6d6hm1552DPtep7y3L"; // หรือ Dify Key ของบอทอสังหาฯ
    const GROUP_CHAT_ID = "-1003836823063";
    const HUB_URL = "https://script.google.com/macros/s/AKfycbyJsIZCiSLtqoklyVNbZ3Nj24BsNb9x16xiR3PWEE-1lks6izmxZOASKxy0BzLnuxjx/exec";

    if (request.method === "POST") {
      try {
        const update = await request.json();
        if (!update.message) return new Response("OK");

        const msg = update.message;
        const chatId = msg.chat.id;
        const isGroup = msg.chat.type === "group" || msg.chat.type === "supergroup";
        const text = msg.text || "";
        const caption = msg.caption || "";
        const senderName = msg.from ? msg.from.first_name : "Customer";
        const username = msg.from && msg.from.username ? `@${msg.from.username}` : "";

        const creditFooter = "\n\nCredit Ajarn.Ruj : www.ai2rich.net\nLine: @999qihww\nhttps://line.me/R/ti/p/@999qihww\nTelegram: t.me/Ai2rich_OfficialBot\nTel./WhatsApp: 0864949987";

        // =============================================================
        // 🌟 1. ดักจับคำสั่ง /start ต้อนรับลูกค้าดูพูลวิลล่าและคอนโด
        // =============================================================
        if (!isGroup && text.startsWith("/start")) {
          fetch(`${HUB_URL}?action=add_subscriber&chat_id=${chatId}&name=${encodeURIComponent(senderName)}&username=${encodeURIComponent(username)}`).catch(()=>{});

          const welcomeRealEstate = `🏡 ยินดีต้อนรับสู่ "Phuket Real Estate & Luxury Villa AI" 🏝️✨\nผู้ช่วยค้นหาพูลวิลล่า คอนโดวิวทะเล และอสังหาริมทรัพย์เพื่อการลงทุนในภูเก็ต (บริการ 24 ชม.)\n\n🌟 บริการของเรา:\n• ค้นหาพูลวิลล่าหรู โซนบางเทา ลากูน่า กะตะ ราไวย์ กมลา\n• พูลวิลล่าเช่ารายวัน / รายเดือน / เพื่อการอยู่อาศัย\n• อสังหาริมทรัพย์เพื่อการลงทุน การันตีผลตอบแทน (Rental Yield)\n• จัดนัดหมายพาชมวิลล่าจริงและประสานงานเอเจนท์\n\n💡 ลองพิมพ์สอบถาม เช่น:\n• "สนใจพูลวิลล่าโซนบางเทา งบ 20-30 ล้านบาท"\n• "หาพูลวิลล่าเช่ารายวันแถวกะตะ 3 ห้องนอน สำหรับครอบครัว"\n• "มีคอนโดวิวทะเลเปิดใหม่แถวกมลาไหม"\n${creditFooter}`;

          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: welcomeRealEstate })
          });
          return new Response("OK");
        }

        // =============================================================
        // 📢 2. ระบบ Broadcast แจ้งโปรโมชั่น/เปิดตัววิลล่าใหม่จากกลุ่มแอดมิน
        // =============================================================
        if (isGroup && (text.startsWith("/broadcast") || caption.startsWith("/broadcast"))) {
          let broadcastContent = (text || caption).replace("/broadcast", "").trim();
          let subscribers = ["479106422"];
          try {
            const subRes = await fetch(`${HUB_URL}?action=get_subscribers`);
            const fetchedList = await subRes.json();
            if (fetchedList && fetchedList.length > 0) subscribers = fetchedList;
          } catch(e) {}

          let successCount = 0;
          for (let customerId of subscribers) {
            try {
              if (msg.photo && msg.photo.length > 0) {
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ chat_id: customerId, photo: msg.photo[msg.photo.length - 1].file_id, caption: broadcastContent + creditFooter })
                });
              } else if (msg.video) {
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ chat_id: customerId, video: msg.video.file_id, caption: broadcastContent + creditFooter })
                });
              } else if (broadcastContent) {
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ chat_id: customerId, text: `📢 **อัปเดตอสังหาริมทรัพย์และพูลวิลล่าภูเก็ต**\n\n${broadcastContent}${creditFooter}` })
                });
              }
              successCount++;
            } catch(e) {}
          }

          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: `✅ บรอดแคสต์วิลล่าใหม่ถึงลูกค้าทั้งหมด ${successCount} ท่านเรียบร้อยแล้วครับ` })
          });
          return new Response("OK");
        }

        // =============================================================
        // 👤 3. ตอบแชท 1:1 กับลูกค้าอสังหาริมทรัพย์
        // =============================================================
        if (!isGroup && text) {
          fetch(`${HUB_URL}?action=add_subscriber&chat_id=${chatId}&name=${encodeURIComponent(senderName)}&username=${encodeURIComponent(username)}`).catch(()=>{});

          const difyRes = await fetch("https://api.dify.ai/v1/chat-messages", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${DIFY_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: {}, query: text, response_mode: "blocking", user: String(chatId) })
          });

          const difyData = await difyRes.json();
          let replyText = difyData.answer || difyData.message || "ขออภัยครับ ระบบกำลังประมวลผลข้อมูลอสังหาริมทรัพย์";
          if (!replyText.includes("Credit Ajarn.Ruj")) replyText += creditFooter;

          // ตอบกลับลูกค้าในแชท 1:1
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: replyText })
          });

          // ส่งแจ้งเตือนลีดลูกค้าเข้ากลุ่มแอดมิน Real-time
          if (GROUP_CHAT_ID && GROUP_CHAT_ID.startsWith("-100")) {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: GROUP_CHAT_ID,
                text: `🏡 **[ลีดลูกค้าอสังหาฯ ใหม่]**\n👤 ${senderName} (ID: \`${chatId}\`)\n💬 "${text}"\n\n🤖 **AI ตอบกลับแล้ว:**\n${replyText}`
              })
            });
          }
        }
      } catch (err) {
        console.error("Worker Error:", err);
      }
      return new Response("OK");
    }
    return new Response("Phuket Real Estate AI Hub is Active");
  }
};
