// ===== E-BODY DATA =====
const ebodyData = [
    // ===== ADVISORS (shown first, side by side) =====
    {
        post: "Advisors",
        members: [
            {
                name: "Dr. Yogendra Mohan",
                role: "Faculty Advisor",
                image: "images/ebody/dr-yogendra-mohan.jpg",
                bio: "Faculty Advisor guiding STCC with years of academic and industry experience.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            },
            {
                name: "Dr. Manoj Das",
                role: "Technical Advisor",
                image: "images/ebody/dr-manoj-das.jpg",
                bio: "Technical Advisor providing expertise in technology and innovation.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ],
        isAdvisor: true
    },
    // ===== STUDENT LEADERSHIP =====
    {
        post: "President",
        members: [
            {
                name: "Sanjay Kumar",
                image: "images/ebody/sanjay-kumar.jpg",
                bio: "Leading STCC with a vision to build the next generation of technologists.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ],
        leadership: true
    },
    {
        post: "Vice President",
        members: [
            {
                name: "Hemam Naresh Singh",
                image: "images/ebody/hemam-naresh.jpg",
                bio: "Driving community engagement and student development initiatives.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ],
        leadership: true
    },
    {
        post: "General Secretary",
        members: [
            {
                name: "Manash Ranjan Sahu",
                image: "images/ebody/manash-ranjan.jpg",
                bio: "Managing operations and ensuring smooth functioning of STCC.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ],
        leadership: true
    },
    {
        post: "Assistant General Secretary",
        members: [
            {
                name: "Ramchandra Bishnoi",
                image: "images/ebody/ramchandra.jpg",
                bio: "Supporting the General Secretary in administrative tasks.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Organizing Secretary",
        members: [
            {
                name: "Shyamal Chakraborty",
                image: "images/ebody/shyamal.jpg",
                bio: "Coordinating events and ensuring successful execution.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Assistant Organizing Secretary",
        members: [
            {
                name: "Ritik Sharma",
                image: "images/ebody/ritik.jpg",
                bio: "Assisting in event coordination and planning.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Finance Secretary",
        members: [
            {
                name: "Subham Paul",
                image: "images/ebody/subham-paul.jpg",
                bio: "Managing finances and budgeting for STCC activities.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Assistant Finance Secretary",
        members: [
            {
                name: "Anirban Debnath",
                image: "images/ebody/anirban.jpg",
                bio: "Assisting in financial management and record keeping.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Event Coordinator",
        members: [
            {
                name: "Arnav Ranjan",
                image: "images/ebody/arnav.jpg",
                bio: "Planning and executing STCC events and workshops.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Technical Head",
        members: [
            {
                name: "Abhinav Kumar",
                image: "images/ebody/abhinav.jpg",
                bio: "Leading the technical initiatives and development at STCC.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ],
        leadership: true
    },
    {
        post: "Co Technical Head",
        members: [
            {
                name: "Debanjan Baidya",
                image: "images/ebody/debanjan.jpg",
                bio: "Co-leading technical projects and mentoring the team.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            },
            {
                name: "Harsh Tiwari",
                image: "images/ebody/harsh.jpg",
                bio: "Co-leading technical projects and mentoring the team.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Events Management Lead",
        members: [
            {
                name: "Shubham Kumar Bihari",
                image: "images/ebody/shubham-bihari.jpg",
                bio: "Managing events and ensuring seamless execution.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Events Management Member",
        members: [
            {
                name: "Samadrita Das",
                image: "images/ebody/samadrita.jpg",
                bio: "Supporting event planning and coordination.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            },
            {
                name: "Bhahen Saikia",
                image: "images/ebody/bhahen.jpg",
                bio: "Supporting event planning and coordination.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Content & Documentation Head",
        members: [
            {
                name: "Himanshu Pandey",
                image: "images/ebody/himanshu.jpg",
                bio: "Leading content creation and documentation efforts.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Content & Documentation Member",
        members: [
            {
                name: "Nirmali Borah",
                image: "images/ebody/nirmali.jpg",
                bio: "Creating content and maintaining documentation.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            },
            {
                name: "Akshar Ratna",
                image: "images/ebody/akshar.jpg",
                bio: "Creating content and maintaining documentation.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Social Media & Outreach Head",
        members: [
            {
                name: "Anushik Singh",
                image: "images/ebody/anushik.jpg",
                bio: "Leading social media and outreach initiatives.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Social Media & Outreach Member",
        members: [
            {
                name: "Abu Junayed Tammoy",
                image: "images/ebody/abu-junayed.jpg",
                bio: "Managing social media presence and engagement.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            },
            {
                name: "Ghrish Aroja Maibam",
                image: "images/ebody/ghrish.jpg",
                bio: "Managing social media presence and engagement.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            },
            
            {
                name: "Nongmaithem Nirupama Devi",
                image: "images/ebody/nirupama.jpg",
                bio: "Managing social media presence and engagement.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Photography/Videography Lead",
        members: [
            {
                name: "Ashka Dey",
                image: "images/ebody/ashka.jpg",
                bio: "Leading photography and videography for STCC events.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Photography/Videography Member",
        members: [
            {
                name: "Payal",
                image: "images/ebody/payal.jpg",
                bio: "Capturing moments and creating visual content.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            },
            {
                name: "Annu Kumari",
                image: "images/ebody/annu.jpg",
                bio: "Capturing moments and creating visual content.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "First Year Coordinators",
        members: [
            {
                name: "Pranoy Dutta",
                image: "images/ebody/pranoy.jpg",
                bio: "Coordinating first-year student engagement.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            },
            {
                name: "Puspa Yadab",
                image: "images/ebody/puspa.jpg",
                bio: "Coordinating first-year student engagement.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    },
    {
        post: "Executive Members",
        members: [
            {
                name: "Namkam Yangfio",
                image: "images/ebody/namkam.jpg",
                bio: "Executive member supporting STCC operations.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            },
            {
                name: "Niketa Hazarika",
                image: "images/ebody/niketa.jpg",
                bio: "Executive member supporting STCC operations.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            },
            {
                name: "Tarun Goswami",
                image: "images/ebody/tarun.jpg",
                bio: "Executive member supporting STCC operations.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            },
            {
                name: "Anisha Tallo",
                image: "images/ebody/anisha.jpg",
                bio: "Executive member supporting STCC operations.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            },
            {
                name: "Virat Singh",
                image: "images/ebody/virat.jpg",
                bio: "Executive member supporting STCC operations.",
                linkedin: "#",
                github: "#",
                instagram: "#"
            }
        ]
    }
];

// ===== E-BODY CONTROLLER =====
class EbodyController {
    constructor() {
        this.data = ebodyData;
        this.init();
    }

    init() {
        this.renderSections();
        this.setupModal();
        this.setupScrollReveal();
    }

    renderSections() {
        const container = document.getElementById('ebodySections');
        if (!container) return;

        container.innerHTML = '';

        this.data.forEach((section, index) => {
            let sectionClasses = 'post-section';
            if (section.leadership) sectionClasses += ' leadership';
            if (section.isAdvisor) sectionClasses += ' advisors';

            const sectionDiv = document.createElement('div');
            sectionDiv.className = sectionClasses;
            sectionDiv.setAttribute('data-index', index);

            let gridClass = 'members-grid';
            const count = section.members.length;
            if (section.isAdvisor) {
                gridClass += ' advisors-grid';
            } else if (count === 1) {
                gridClass += ' single';
            } else if (count === 2) {
                gridClass += ' two';
            } else if (count === 3) {
                gridClass += ' three';
            } else if (count >= 4) {
                gridClass += ' four';
            }

            let membersHTML = '';
            section.members.forEach((member, mIndex) => {
                const roleTag = member.role ? `<span class="member-role-tag">${member.role}</span>` : '';
                membersHTML += `
                    <div class="member-card" data-section="${index}" data-member="${mIndex}">
                        <div class="member-photo-wrapper">
                            <img src="${member.image}" alt="${member.name}" class="member-photo" loading="lazy" />
                        </div>
                        <div class="member-name">${member.name}</div>
                        ${roleTag}
                        <div class="member-social">
                            <a href="${member.linkedin || '#'}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" onclick="event.stopPropagation();">
                                <i class="fab fa-linkedin-in"></i>
                            </a>
                            <a href="${member.github || '#'}" target="_blank" rel="noopener noreferrer" aria-label="GitHub" onclick="event.stopPropagation();">
                                <i class="fab fa-github"></i>
                            </a>
                            <a href="${member.instagram || '#'}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" onclick="event.stopPropagation();">
                                <i class="fab fa-instagram"></i>
                            </a>
                        </div>
                    </div>
                `;
            });

            let dividerHTML = '';
            if (index > 0) {
                dividerHTML = `
                    <div class="section-divider">
                        <span class="line"></span>
                        <span class="dot"></span>
                        <span class="line"></span>
                    </div>
                `;
            }

            const postTitle = section.isAdvisor ? 'Advisors' : section.post;

            sectionDiv.innerHTML = `
                ${dividerHTML}
                <div class="post-title">
                    <h3>${postTitle}</h3>
                </div>
                <div class="${gridClass}">
                    ${membersHTML}
                </div>
            `;

            container.appendChild(sectionDiv);

            const cards = sectionDiv.querySelectorAll('.member-card');
            cards.forEach((card, mIndex) => {
                card.addEventListener('click', () => {
                    this.openModal(index, mIndex);
                });
            });
        });

        setTimeout(() => {
            this.revealSections();
        }, 200);
    }

    revealSections() {
        const sections = document.querySelectorAll('.post-section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    setupModal() {
        const modal = document.getElementById('profileModal');
        const overlay = document.getElementById('modalOverlay');
        const close = document.getElementById('modalClose');

        close.addEventListener('click', () => this.closeModal());
        overlay.addEventListener('click', () => this.closeModal());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    openModal(sectionIndex, memberIndex) {
        const section = this.data[sectionIndex];
        if (!section) return;
        const member = section.members[memberIndex];
        if (!member) return;

        const modal = document.getElementById('profileModal');

        document.getElementById('modalPhoto').src = member.image;
        document.getElementById('modalPhoto').alt = member.name;
        document.getElementById('modalName').textContent = member.name;
        document.getElementById('modalRole').textContent = member.role || section.post;
        document.getElementById('modalBio').textContent = member.bio || 'Member of STCC E-Body.';
        document.getElementById('modalGithub').href = member.github || '#';
        document.getElementById('modalLinkedin').href = member.linkedin || '#';
        document.getElementById('modalInstagram').href = member.instagram || '#';

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('profileModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    setupScrollReveal() {
        const sections = document.querySelectorAll('.ebody-built, .ebody-cta');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'all 0.8s ease';
            observer.observe(section);
        });
    }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    const ebody = new EbodyController();
});

console.log('🚀 E-Body page loaded successfully!');