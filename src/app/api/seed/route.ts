import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Create sample audit checklists
    const checklists = [
      {
        category: "Infrastructure",
        title: "Digital Infrastructure Assessment",
        description: "Evaluate your school's digital hardware and network capabilities",
        weight: 3,
        isRequired: true,
        items: [
          {
            title: "Internet Connectivity",
            description: "Upload a speed test result showing minimum 10 Mbps download speed",
            points: 10,
            evidenceType: "SPEED_TEST",
            isRequired: true
          },
          {
            title: "Computer Lab Setup",
            description: "Provide photos of your computer lab with at least 20 functional computers",
            points: 15,
            evidenceType: "PHOTO",
            isRequired: true
          },
          {
            title: "Smart Classroom Equipment",
            description: "Show photos of smart boards, projectors, or digital teaching aids",
            points: 10,
            evidenceType: "PHOTO",
            isRequired: false
          },
          {
            title: "Network Security",
            description: "Describe your network security measures and firewall configuration",
            points: 8,
            evidenceType: "TEXT",
            isRequired: true
          }
        ]
      },
      {
        category: "Digital Literacy",
        title: "Teacher Digital Competency",
        description: "Assess the digital skills and training of your teaching staff",
        weight: 2,
        isRequired: true,
        items: [
          {
            title: "Teacher Training Records",
            description: "Upload certificates of digital literacy training completed by teachers",
            points: 12,
            evidenceType: "DOCUMENT",
            isRequired: true
          },
          {
            title: "Digital Teaching Materials",
            description: "Share screenshots of digital lesson plans or teaching materials",
            points: 8,
            evidenceType: "SCREENSHOT",
            isRequired: false
          },
          {
            title: "Student Digital Projects",
            description: "Show examples of student work created using digital tools",
            points: 10,
            evidenceType: "PHOTO",
            isRequired: false
          }
        ]
      },
      {
        category: "Policy & Governance",
        title: "Digital Policy Framework",
        description: "Evaluate your school's digital policies and governance structure",
        weight: 2,
        isRequired: true,
        items: [
          {
            title: "Digital Policy Document",
            description: "Upload your school's digital learning policy document",
            points: 10,
            evidenceType: "DOCUMENT",
            isRequired: true
          },
          {
            title: "Data Privacy Policy",
            description: "Provide your student data privacy and protection policy",
            points: 8,
            evidenceType: "DOCUMENT",
            isRequired: true
          },
          {
            title: "IT Support Team",
            description: "Describe your IT support structure and response procedures",
            points: 6,
            evidenceType: "TEXT",
            isRequired: false
          }
        ]
      },
      {
        category: "Innovation",
        title: "Digital Innovation Initiatives",
        description: "Showcase innovative digital practices and future readiness",
        weight: 1,
        isRequired: false,
        items: [
          {
            title: "AI Integration",
            description: "Demonstrate how AI tools are used in teaching or administration",
            points: 8,
            evidenceType: "VIDEO",
            isRequired: false
          },
          {
            title: "Coding Programs",
            description: "Show evidence of coding or computer science programs",
            points: 10,
            evidenceType: "PHOTO",
            isRequired: false
          },
          {
            title: "Digital Collaboration",
            description: "Provide examples of online collaboration tools usage",
            points: 6,
            evidenceType: "SCREENSHOT",
            isRequired: false
          }
        ]
      }
    ]

    const createdChecklists: any[] = []
    
    for (const checklistData of checklists) {
      const checklist = await db.auditChecklist.create({
        data: {
          category: checklistData.category,
          title: checklistData.title,
          description: checklistData.description,
          weight: checklistData.weight,
          isRequired: checklistData.isRequired,
          items: {
            create: checklistData.items.map(item => ({
              title: item.title,
              description: item.description,
              points: item.points,
              evidenceType: item.evidenceType as any,
              isRequired: item.isRequired
            }))
          }
        },
        include: {
          items: true
        }
      })
      createdChecklists.push(checklist)
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdChecklists.length} audit checklists`,
      checklists: createdChecklists
    })

  } catch (error) {
    console.error('Seed audit checklists error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}