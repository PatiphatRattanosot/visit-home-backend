
export const verify_admin_or_teacher = (roles: string[]) => {
    const is_admin = roles.includes('Admin');
    const is_teacher = roles.includes('Teacher');
    if (!is_admin && !is_teacher) {
        return { type: false, status: 403, message: 'คุณไม่ใช่ครูและไม่มีสิทธิ์เข้าถึง'  };
    }
  return { type:true}
}

export const verify_admin = (roles: string[]) => {
    const is_admin = roles.includes('Admin');
    if (!is_admin) {
        return { type: false, status: 403, message: 'คุณไม่ใช่เจ้าหน้าที่และไม่มีสิทธิ์เข้าถึง'  };
    }
    return { type:true}
}