/** Schools, faculties, departments and levels suggested in the campus application (from the Enski Campus Ambassador project). */
export const SCHOOLS: Record<string, string[]> = {
  Nigeria: ["University of Lagos", "University of Ibadan", "Obafemi Awolowo University", "University of Nigeria, Nsukka", "Ahmadu Bello University", "Covenant University", "Lagos State University", "University of Benin", "University of Ilorin", "University of Port Harcourt", "Federal University of Technology, Akure", "Federal University of Technology, Minna", "Nnamdi Azikiwe University", "University of Abuja", "Babcock University", "Pan-Atlantic University", "American University of Nigeria", "Landmark University", "Afe Babalola University", "Bayero University Kano", "University of Calabar", "University of Jos", "Rivers State University", "Yaba College of Technology", "Lagos State University of Science and Technology"],
};
export const COUNTRIES = Object.keys(SCHOOLS);

export const FACULTIES = ["Arts", "Science", "Engineering", "Law", "Medicine", "Pharmacy", "Social Sciences", "Management Sciences", "Education", "Agriculture", "Environmental Sciences", "Basic Medical Sciences", "Computing", "Communication and Media"];
export const DEPARTMENTS = ["Computer Science", "Software Engineering", "Accounting", "Economics", "Business Administration", "Mass Communication", "Law", "Medicine and Surgery", "Nursing", "Pharmacy", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Architecture", "Psychology", "Political Science", "English", "Biochemistry", "Microbiology", "Marketing", "Finance", "Estate Management"];
export const LEVELS = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "600 Level", "Postgraduate", "Diploma / ND", "HND"];

export const DIAL: Record<string, string> = { Nigeria: "+234" };
