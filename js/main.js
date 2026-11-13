const lessons = {
  chatgpt: {
    tool: "ChatGPT",
    title: "Viết email xin dời lịch họp",
    description: "Thực hành cách nêu bối cảnh, yêu cầu và giọng điệu trong cùng một prompt.",
    steps: [
      "Sao chép prompt bên dưới và dán vào ChatGPT.",
      "Thay thời gian và lý do bằng một tình huống bạn muốn tập.",
      "Đọc lại email và kiểm tra lời đề nghị, thời gian mới và cách xưng hô."
    ],
    prompt: "Hãy giúp tôi viết email xin dời cuộc họp nhóm từ 9 giờ sáng thứ Ba sang 14 giờ thứ Tư vì trùng lịch học. Viết bằng tiếng Việt, giọng lịch sự, dưới 100 từ. Thêm một dòng tiêu đề và hỏi người nhận xem giờ mới có phù hợp không."
  },
  gemini: {
    tool: "Gemini",
    title: "Lập kế hoạch học một kỹ năng mới",
    description: "Thực hành chia mục tiêu lớn thành các việc nhỏ phù hợp với thời gian của bạn.",
    steps: [
      "Sao chép prompt bên dưới và dán vào Gemini.",
      "Đổi kỹ năng và thời lượng thành mục tiêu của bạn.",
      "Chọn một ngày trong kế hoạch rồi yêu cầu Gemini chia bài tập thành từng bước."
    ],
    prompt: "Tôi muốn học cách tạo biểu đồ đơn giản trong Excel và có 20 phút mỗi ngày. Hãy lập kế hoạch 5 ngày cho người mới. Trình bày dưới dạng bảng với các cột Ngày, Kỹ năng, Bài tập và Cách kiểm tra kết quả."
  },
  notebook: {
    tool: "NotebookLM",
    title: "Ôn tập từ tài liệu của bạn",
    description: "Thực hành tạo câu hỏi ôn tập và đối chiếu câu trả lời với tài liệu gốc.",
    steps: [
      "Mở một sổ tay trong NotebookLM và thêm một tài liệu học tập ngắn.",
      "Dán prompt bên dưới vào khung trò chuyện của sổ tay.",
      "Thử tự trả lời trước khi xem gợi ý, sau đó mở trích dẫn để kiểm tra."
    ],
    prompt: "Dựa vào tài liệu trong sổ tay, hãy tạo 5 câu hỏi ôn tập từ dễ đến khó. Đặt đáp án gợi ý ở cuối và dẫn nguồn cho từng đáp án để tôi đối chiếu với tài liệu gốc."
  }
};

const dialog = document.querySelector(".lesson-dialog");
const lessonTool = document.querySelector("#lesson-tool");
const lessonTitle = document.querySelector("#lesson-title");
const lessonDescription = document.querySelector("#lesson-description");
const lessonSteps = document.querySelector("#lesson-steps");
const lessonPrompt = document.querySelector("#lesson-prompt");
const progress = document.querySelector("#course-progress");
const progressCount = document.querySelector("#progress-count");
const progressAction = document.querySelector("#progress-action");
const courseLinks = [...document.querySelectorAll(".course-grid [data-course-lesson]")];

function updateProgress() {
  let opened = [];
  try {
    opened = courseLinks.filter((link) =>
      localStorage.getItem(`lop-hoc-ai.course-opened.${link.dataset.courseLesson}`) === "1"
    );
  } catch {
    // The course links remain usable without browser storage.
  }
  const nextLesson = courseLinks.find((link) => !opened.includes(link));
  progress.max = courseLinks.length;
  progress.value = opened.length;
  progressCount.textContent = `${opened.length} / ${courseLinks.length}`;
  progressAction.href = (nextLesson ?? courseLinks[0]).href;
  if (!opened.length) {
    progressAction.textContent = "Mở bài đầu tiên";
  } else if (nextLesson) {
    progressAction.textContent = `Học tiếp Bài ${nextLesson.dataset.courseLesson}`;
  } else {
    progressAction.textContent = "Xem lại từ bài đầu";
  }
}

updateProgress();
window.addEventListener("pageshow", updateProgress);
window.addEventListener("storage", updateProgress);

for (const button of document.querySelectorAll("[data-lesson]")) {
  button.addEventListener("click", () => {
    const lesson = lessons[button.dataset.lesson];
    lessonTool.textContent = lesson.tool;
    lessonTitle.textContent = lesson.title;
    lessonDescription.textContent = lesson.description;
    lessonPrompt.textContent = lesson.prompt;
    lessonSteps.replaceChildren(...lesson.steps.map((step) => {
      const item = document.createElement("li");
      item.textContent = step;
      return item;
    }));
    dialog.querySelector(".copy-status").textContent = "";
    dialog.querySelector(".copy-button").textContent = "Sao chép";
    dialog.showModal();
    dialog.scrollTop = 0;
  });
}

for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    const prompt = document.getElementById(button.dataset.copy);
    const status = button.closest(".prompt-card").querySelector(".copy-status");

    try {
      await navigator.clipboard.writeText(prompt.textContent.trim());
      button.textContent = "Đã sao chép";
      status.textContent = "Bạn có thể dán prompt vào công cụ đang học.";
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(prompt);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = "Prompt đã được bôi đen. Nhấn Ctrl+C hoặc chọn Sao chép.";
    }
  });
}
